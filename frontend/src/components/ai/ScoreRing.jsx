
export default function ScoreRing({ score = 0, label = "Score" }) {
  const normalized = Math.max(0, Math.min(100, score));
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (normalized / 100) * circumference;

  return (
    <div className="inline-flex flex-col items-center justify-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 text-center shadow-glow">
      <div className="relative h-36 w-36">
        <svg viewBox="0 0 130 130" className="h-full w-full">
          <circle cx="65" cy="65" r="52" className="fill-none stroke-white/10" strokeWidth="10" />
          <circle cx="65" cy="65" r="52" className="fill-none stroke-neon-blue transition-all duration-500" strokeWidth="10" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 65 65)" />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div>
            <p className="text-3xl font-semibold text-white">{normalized}%</p>
            <p className="text-sm text-slate-400">{label}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

