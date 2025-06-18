// src/pages/Game.jsx
import { useEffect, useState } from "react";
import api from "../api/axios";
 import countdownSound from "../assets/sounds/countdown3to0.mp3";

export default function Game() {
  const [spielerName, setSpielerName] = useState("");
  const [nameConfirmed, setNameConfirmed] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [zeit, setZeit] = useState(60);
  const [punkte, setPunkte] = useState(0);
  const [spielLaeuft, setSpielLaeuft] = useState(false);
  const [munition, setMunition] = useState(6);
  const [gegner, setGegner] = useState([]);
  const [besiegtePokemons, setBesiegtePokemons] = useState([]);

  const schussSound = new Audio("/src/assets/sounds/schuss.mp3");
  const nachladenSound = new Audio("/src/assets/sounds/nachladen.mp3");
  const leerSound = new Audio("/src/assets/sounds/leer.mp3");

  const damage = 15;



  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space" && spielLaeuft) {
        nachladenSound.currentTime = 0;
        nachladenSound.play();
        setMunition(6);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [spielLaeuft]);

  useEffect(() => {
    if (nameConfirmed) {
      setCountdown(3);
    }
  }, [nameConfirmed]);

  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    if (countdown === 0) {
      setSpielLaeuft(true);
    }
  }, [countdown]);

  useEffect(() => {
    if (!spielLaeuft) return;
    if (zeit <= 0) {
      setSpielLaeuft(false);
      return;
    }
    const interval = setInterval(() => {
      setZeit((z) => z - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [spielLaeuft, zeit]);

  useEffect(() => {
    if (!spielLaeuft) return;

    let spawnTimeout;

    const spawnLoop = () => {
      const delay = zeit > 50 ? 3000 : zeit > 30 ? 2000 : 1000;
      spawnTimeout = setTimeout(() => {
        spawnPokemon();
        spawnLoop(); // Rekursiv weiter
      }, delay);
    };

    spawnLoop();
    spawnPokemon();
    return () => clearTimeout(spawnTimeout);
  }, [spielLaeuft, zeit]);



const spawnPokemon = async () => {
  const spawnFenster = [
      { top: 600, left: 180 },
      { top: 600, left: 380 },
      { top: 600, left: 580 },
      { top: 600, left: 780 },
      { top: 600, left: 980 },
      { top: 80, left: 150 },
      { top: 80, left: 300 },
      { top: 80, left: 450 },
      { top: 80, left: 600 },
      { top: 80, left: 750 },
      { top: 80, left: 900 },
      { top: 80, left: 1050 },
      { top: 260, left: 150 },
      { top: 260, left: 300 },
      { top: 260, left: 450 },
      { top: 260, left: 600 },
      { top: 260, left: 750 },
      { top: 260, left: 900 },
      { top: 260, left: 1050 },
      { top: 450, left: 300 },
      { top: 450, left: 450 },
      { top: 450, left: 750 },
      { top: 450, left: 900 },
    ];
    

  try {
    const res = await api.get("/pokemon/random");
    const data = res.data;
    console.log(res.data);

    const soundUrl = res.data.cry;

      // blockierte Positionen rausfiltern
      const belegte = gegner.map((g) => `${g.position.top}-${g.position.left}`);
      const freieFenster = spawnFenster.filter(
        (pos) => !belegte.includes(`${pos.top}-${pos.left}`)
      );

      if (freieFenster.length === 0) return; // alles voll

      const zufallsPosition =
        freieFenster[Math.floor(Math.random() * freieFenster.length)];

      const gegnerObj = {
        idInstance: crypto.randomUUID(),
        name: data.name,
        sprite: data.sprite,
        maxHp: data.hp,
        currentHp: data.hp,
        xp: data.xp || 100,
        position: zufallsPosition,
      };

    setGegner((prev) => [...prev, gegnerObj]);

    // Sound erst jetzt abspielen (nach dem spawn)
    if (soundUrl) {
      const audio = new Audio(soundUrl);
      audio.volume = 0.1;
      audio.play().catch((err) => console.warn("Soundfehler:", err));
    }

    // automatisch nach 6 Sekunden wieder entfernen
    setTimeout(() => {
      setGegner((prev) =>
        prev.filter((g) => g.idInstance !== gegnerObj.idInstance)
      );
    }, 6000);
  } catch (err) {
    console.error("Fehler beim Laden vom Backend:", err);
  }
};


  const handleSave = async () => {
     try {
          const data = await api.post("/leaderboard", {
                username: spielerName,
                score: punkte,
                date: new Date().toISOString(),
              });
      console.log("Gespeichert:", data);
    } catch (err) {
      console.log("Fehler beim Speichern:", err);
    }
  };
    

  const handleShoot = () => {
    if (!spielLaeuft || munition <= 0) {
      leerSound.currentTime = 0;
      leerSound.play();
      return;
    } 

    schussSound.volume = 0.5;
    schussSound.currentTime = 0;
    schussSound.play();
    setMunition((m) => m - 1);
    
  };

const handleTreffer = (idInstance) => {
  setGegner((prev) => {
    const neueListe = [];
    let besiegter = null;

    for (const g of prev) {
      if (g.idInstance === idInstance) {
        const newHp = g.currentHp - damage;
        if (newHp <= 0) {
          besiegter = g;
          continue; // NICHT in neueListe pushen – Gegner ist tot
        }
        neueListe.push({ ...g, currentHp: newHp });
      } else {
        neueListe.push(g); // Unverändert rein
      }
    }

    if (besiegter) {
      const xpBonus = besiegter.maxHp || 10;
      setPunkte((p) => p + xpBonus);

      setBesiegtePokemons((prevKills) => {
        const already = prevKills.find((p) => p.name === besiegter.name);
        if (already) {
          return prevKills.map((p) =>
            p.name === besiegter.name
              ? { ...p, anzahl: p.anzahl + 1 }
              : p
          );
        } else {
          return [
            ...prevKills,
            {
              name: besiegter.name,
              sprite: besiegter.sprite,
              anzahl: 1,
            },
          ];
        }
      });
    }

    return neueListe;
  });
};

  useEffect(() => {
    if (nameConfirmed) {
      const audio = new Audio(countdownSound);
      audio.playbackRate = 1.1;
      audio.play();
      setCountdown(3);
    }
  }, [nameConfirmed]);

  if (!nameConfirmed) {
    
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-6">Dein Name?</h1>
        <input
          className="px-4 py-2 rounded mb-4"
          placeholder="Spielername"
          value={spielerName}
          onChange={(e) => setSpielerName(e.target.value)}
        />
        <button
          onClick={() => {
            if (spielerName.trim() !== "") setNameConfirmed(true);
          }}
          className="bg-yellow-400 hover:bg-yellow-300 text-black px-6 py-2 rounded shadow-lg"
        >
          Starten
        </button>
      </div>
    );
  }

  if (countdown > 0) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <h1 className="text-6xl font-bold animate-pulse">{countdown}</h1>
      </div>
    );
  }
    if (!spielLaeuft && zeit === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-6">Spiel vorbei!</h1>
        <p className="text-xl mb-4">Punkte: {punkte}</p>
        <div className="grid grid-cols-2 md:grid-cols-8 gap-6">
          {besiegtePokemons.map((poke) => (
            <div key={poke.name} className="text-center">
              <img src={poke.sprite} alt={poke.name} className="w-20 mx-auto" />
              <p className="text-sm mt-1">{poke.name}</p>
              <p className="text-yellow-400 font-bold">× {poke.anzahl}</p>
            </div>
          ))}
        </div>
        <a href="/">
          <div className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg text-lg shadow-lg border border-white" onClick= {handleSave}>
            Zurück zum Start
          </div>
        </a>
      </div>
    );
  }


  return (<div className="relative w-[1280px] h-[720px] mx-auto cursor-crosshair overflow-hidden bg-black">
      <img
        src="/src/assets/bg1_game.png"
        alt="Spielfeld"
        className="absolute inset-0 w-full h-full object-contain z-0"
      />

      <div className="absolute inset-0 z-10" onClick={handleShoot} bg-black>
        {/* HUD */}
        <div className="absolute top-4 left-4 bg-black/60 text-white px-4 py-2 rounded shadow">
          Zeit: {zeit}s
        </div>
        <div className="absolute top-4 right-4 bg-black/60 text-white px-4 py-2 rounded shadow">
          Punkte: {punkte}
        </div>

        {/* MUNITION */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className={`w-4 h-8 border-2 rounded-sm ${
                index < munition ? "bg-yellow-400" : "bg-gray-600"
              }`}
            ></div>
          ))}
        </div>

        {/* GEGNER */}
        {gegner.map((g) => (
          <div
            key={g.idInstance}
            style={{
              position: "absolute",
              top: g.position.top,
              left: g.position.left,
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (munition > 0) {
                handleShoot(); // Munition runter
                handleTreffer(g.idInstance); // Schaden rein
              }
            }}
            className="cursor-crosshair"
          >
            <img src={g.sprite} alt={g.name} className="w-20" />
            <div className="w-full h-1 bg-red-600 mt-1">
              <div
                className="h-full bg-green-400"
                style={{ width: `${(g.currentHp / g.maxHp) * 100}%` }}
              ></div>
            </div>
          </div>
          
        ))}
      
      </div>
    </div>
  );
}
