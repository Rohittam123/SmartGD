
import Card from "../common/Card.jsx";

export default function StatCard({ value, label, icon }) {
  const Icon = icon;

  return (
    <Card className="flex items-center justify-between gap-4 p-6">
      <div>
        <p className="text-sm text-slate-400">{label}</p>
        <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
      </div>
      {Icon ? (
        <div className="rounded-3xl bg-white/5 p-4 text-neon-blue">
          <Icon size={28} />
        </div>
      ) : null}
    </Card>
  );
}

