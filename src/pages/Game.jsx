// src/pages/Game.jsx
import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Game() {
  const [spielerName, setSpielerName] = useState("");
  const [nameConfirmed, setNameConfirmed] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [zeit, setZeit] = useState(60);
  const [punkte, setPunkte] = useState(0);
  const [spielLaeuft, setSpielLaeuft] = useState(false);
  const [munition, setMunition] = useState(6);
  const [gegner, setGegner] = useState([]);

  const damage = 15;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space" && spielLaeuft) {
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
    try {
      const res = await api.get("/pokemon/random");
      const data = res.data;
      console.log("Punkte: ", res.data);
      const gegnerObj = {
        idInstance: crypto.randomUUID(),
        name: data.name,
        sprite: data.sprite,
        maxHp: data.hp,
        currentHp: data.hp,
        xp: data.xp || 100,
        position: {
          top: Math.floor(Math.random() * 400) + 200,
          left: Math.floor(Math.random() * 1000) + 200,
        },
      };

      setGegner((prev) => [...prev, gegnerObj]);
    } catch (err) {
      console.error("Fehler beim Laden vom Backend:", err);
    }
  };


 

  const handleShoot = () => {
    if (!spielLaeuft || munition <= 0) return;
    setMunition((m) => m - 1);
  };

 const handleTreffer = (idInstance) => {
  setGegner((prev) => {
    let xpBonus = 0;

    const updated = prev.map((g) => {
      if (g.idInstance === idInstance) {
        const newHp = g.currentHp - damage;
        if (newHp <= 0) {
          xpBonus = g.maxHp || 10; // XP sichern
        }
        return { ...g, currentHp: newHp };
      }
      return g;
    });

    if (xpBonus > 0) {
      setPunkte((p) => p + xpBonus);
    }

    return updated.filter((g) => g.currentHp > 0);
  });
};

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

  return (
    <div className="relative min-h-screen cursor-crosshair">
      <img
        src="/src/assets/bg1_game.png"
        alt="Spielfeld"
        className="absolute inset-0 w-full h-full object-contain z-0"
      />

      <div className="absolute inset-0 z-10" onClick={handleShoot}>
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
              className={`w-4 h-8 border-2 rounded-sm ${index < munition ? "bg-yellow-400" : "bg-gray-600"}`}
            ></div>
          ))}
        </div>

        {/* GEGNER */}
        {gegner.map((g) => (
          <div
            key={g.idInstance}
            style={{ position: "absolute", top: g.position.top, left: g.position.left }}
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