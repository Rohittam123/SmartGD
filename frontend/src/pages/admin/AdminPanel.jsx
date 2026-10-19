
import Card from "../../components/common/Card.jsx";
import { ShieldCheck, Users, ChartBar, Trophy } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";

const panels = [
  { title: "Active users", value: "1,280", icon: Users },
  { title: "GD sessions", value: "72", icon: ChartBar },
  { title: "Top rank", value: "#1", icon: Trophy }
];

export default function AdminPanel() {
  const { profile } = useAuth();

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-glow">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-neon-blue">Admin panel</p>
            <h1 className="text-3xl font-semibold text-white">Welcome, {profile?.name || "Admin"}</h1>
          </div>
          <div className="inline-flex items-center gap-3 rounded-3xl border border-white/10 bg-slate-950/80 px-5 py-3 text-sm text-slate-300">
            <ShieldCheck size={18} />
            Admin access enabled
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {panels.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.title} className="flex items-center gap-4 p-6">
              <div className="rounded-3xl bg-white/5 p-4 text-neon-blue">
                <Icon size={22} />
              </div>
              <div>
                <p className="text-sm text-slate-400">{item.title}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

