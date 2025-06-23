import { useEffect, useState } from "react";
import api from "../api/axios";
import Leaderboard from "../components/Leaderboard";

export default function LeaderboardPage() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchScores() {
      try {
        const res = await api.get("api/leaderboard");
        setScores(res.data.data);
      } catch (error) {
        console.error("Fehler beim Laden der Leaderboard-Daten", error);
      } finally {
        setLoading(false);
      }
    }
    fetchScores();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gradient-to-br">
        <p>Lade Leaderboard...</p>
      </div>
    );
  }

  return <Leaderboard scores={scores} />;
}
