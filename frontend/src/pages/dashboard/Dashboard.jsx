
import { ClipboardList, Sparkles, TrendingUp } from "lucide-react";
import Card from "../../components/common/Card.jsx";
import PerformanceChart from "../../components/dashboard/PerformanceChart.jsx";
import StatCard from "../../components/dashboard/StatCard.jsx";
import RankCard from "../../components/dashboard/RankCard.jsx";
import { useAuth } from "../../hooks/useAuth.js";

const stats = [
  { label: "Sessions completed", value: 42, icon: ClipboardList },
  { label: "Average score", value: "86%", icon: TrendingUp },
  { label: "Peer feedback", value: "97%", icon: Sparkles }
];

export default function Dashboard() {
  const { profile } = useAuth();

  return (
    <div className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-[1fr,360px]">
        <div className="space-y-4">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-glow">
            <p className="text-sm uppercase tracking-[0.3em] text-neon-blue">Welcome back</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">{profile?.name || "Smart GD"}</h1>
            <p className="mt-2 text-slate-400">Here is a quick summary of your recent discussion performance.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {stats.map((item) => (
              <StatCard key={item.label} label={item.label} value={item.value} icon={item.icon} />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <RankCard rank={profile?.rank || 12} name={profile?.name || "You"} score={profile?.averageScore || 78} />
          <Card className="space-y-4 p-6">
            <h2 className="text-lg font-semibold text-white">Quick actions</h2>
            <p className="text-sm text-slate-400">Create a room, practice a new topic, or review your latest feedback.</p>
          </Card>
        </div>
      </div>
      <PerformanceChart />
    </div>
  );
}

