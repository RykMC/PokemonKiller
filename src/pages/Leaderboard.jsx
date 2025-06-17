import { Link } from 'react-router-dom';

export default function Leaderboard() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-800 to-indigo-900 text-white">
      <h1 className="text-4xl font-bold mb-8">🎯 PokéShooter</h1>
      <div className="space-x-4">
        <Link to="/">
          <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg text-lg shadow-lg border border-white">
            zurück
          </button>
        </Link>
      </div>
    </div>
  );
}
