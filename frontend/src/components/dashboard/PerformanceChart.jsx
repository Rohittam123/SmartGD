
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const sampleData = [
  { name: "Mon", score: 62 },
  { name: "Tue", score: 74 },
  { name: "Wed", score: 68 },
  { name: "Thu", score: 79 },
  { name: "Fri", score: 86 },
  { name: "Sat", score: 91 },
  { name: "Sun", score: 88 }
];

export default function PerformanceChart({ data = sampleData }) {
  return (
    <div className="h-72 rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-glow">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Weekly performance</p>
          <h3 className="text-xl font-semibold text-white">Discussion progress</h3>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8" }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: "#94a3b8" }} />
          <Tooltip contentStyle={{ background: "#0f172a", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)" }} />
          <Area type="monotone" dataKey="score" stroke="#38bdf8" strokeWidth={3} fill="url(#scoreGradient)" fillOpacity={1} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

