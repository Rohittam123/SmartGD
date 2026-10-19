
import Card from "../common/Card.jsx";
import { Sparkles } from "lucide-react";

export default function FeedbackCard({ title, score, message }) {
  return (
    <Card className="space-y-4 max-w-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-white">{score}</p>
        </div>
        <div className="grid h-14 w-14 place-items-center rounded-3xl bg-white/10 text-neon-blue">
          <Sparkles size={28} />
        </div>
      </div>
      <p className="text-sm leading-6 text-slate-300">{message}</p>
    </Card>
  );
}

