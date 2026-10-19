
import Card from "../../components/common/Card.jsx";

const stats = [
  { label: "Total sessions", value: "128" },
  { label: "Average rating", value: "4.8/5" },
  { label: "Topics covered", value: "24" }
];

export default function Reports() {
  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-glow">
        <h1 className="text-3xl font-semibold text-white">Reports</h1>
        <p className="mt-3 text-slate-400">Review your session summaries and improvement trends.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((item) => (
          <Card key={item.label} className="p-6">
            <p className="text-sm text-slate-400">{item.label}</p>
            <p className="mt-4 text-3xl font-semibold text-white">{item.value}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

