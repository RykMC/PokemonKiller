import { Link } from "react-router-dom";
import bg from "../assets/bg.png";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-black">
      {/* Hintergrundbild */}
      <img
        src={bg}
        alt="Startscreen Background"
        className="absolute inset-0 w-full h-full object-contain"
      />

      {/* Overlay + Inhalt */}
      <div className="absolute inset-0 bg-black/10 flex flex-col items-center justify-center text-white">
        <div className="space-x-4">
          <Link to="/game">
            <button className="bg-yellow-400 hover:bg-yellow-300 text-black px-6 py-3 rounded-lg text-lg shadow-lg m-7">
              Spiel starten
            </button>
          </Link><br />
          <Link to="/leaderboard">
            <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg text-lg shadow-lg border border-white">
              Highscores ansehen
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}