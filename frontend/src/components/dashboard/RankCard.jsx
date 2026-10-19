
import Card from "../common/Card.jsx";

export default function RankCard({ rank = 1, name = "Contestant", score = 0 }) {
  return (
    <Card className="flex items-center gap-4 p-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10 text-2xl font-semibold text-white">
        #{rank}
      </div>
      <div>
        <p className="text-sm text-slate-400">Top performer</p>
        <h3 className="mt-2 text-lg font-semibold text-white">{name}</h3>
        <p className="mt-1 text-sm text-slate-300">Score: {score}</p>
      </div>
    </Card>
  );
}

