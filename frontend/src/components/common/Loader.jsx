import { Loader2 } from "lucide-react";

export default function Loader({ label = "Loading...", fullScreen = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4 text-slate-300">
      <div className="rounded-full border border-white/10 bg-white/5 p-5 shadow-glow">
        <Loader2 className="animate-spin text-neon-blue" size={34} />
      </div>
      <p className="text-sm">{label}</p>
    </div>
  );

  if (fullScreen) {
    return <main className="grid min-h-screen place-items-center">{content}</main>;
  }

  return content;
}
