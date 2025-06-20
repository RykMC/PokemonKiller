import { Link } from "react-router-dom";
import pokeballIcon from "../assets/Poké_Ball_icon.svg.png";


export default function Leaderboard({ scores }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6">
      <h1 className="text-4xl font-bold mb-8">🎯Leaderboard</h1>
      <div className="w-full max-w-2xl">
        {scores.length === 0 && (
          <p className="text-center">Keine Einträge gefunden.</p>
        )}

        {scores.map((score, index) => {
          const platz = index + 1;
          const medal = ["🥇", "🥈", "🥉"][index] || `${platz}.`;
          return (
            <div
              key={score._id}
              className="flex justify-between items-center bg-yellow-300/40 hover:bg-yellow-500/80 transition-colors rounded-md p-4 mb-3 shadow-lg"
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">{medal}</span>
                <div className="flex flex-col">
                  <span className="text-xl font-semibold">
                    {score.username}
                  </span>
                  <span className="text-xs text-gray-300">
                    {new Date(score.date).toLocaleDateString("de-DE")}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-yellow-400 font-bold text-lg">
                <img src={pokeballIcon} alt="Pokéball" className="w-6 h-6" />

                <span>{score.score}</span>
              </div>
            </div>
          );
        })}
      </div>
      <Link to="/">
        <button className="mt-8 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg text-lg shadow-lg border border-white">
          zurück
        </button>
      </Link>
    </div>
  );
}
