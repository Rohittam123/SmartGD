
import { useEffect, useState } from "react";
import { listenToLeaderboard } from "../../services/leaderboardService.js";
import Card from "../../components/common/Card.jsx";

export default function Leaderboard() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const unsubscribe = listenToLeaderboard(setEntries);
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-glow">
        <h1 className="text-3xl font-semibold text-white">Leaderboard</h1>
        <p className="mt-3 text-slate-400">Track the top performers and your rank.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {entries.slice(0, 8).map((entry) => (
          <Card key={entry.id} className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">Rank {entry.rank}</p>
                <h2 className="mt-2 text-xl font-semibold text-white">{entry.name || "Anonymous"}</h2>
              </div>
              <div className="rounded-3xl bg-white/5 px-4 py-2 text-sm text-slate-300">{entry.score || 0} pts</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

