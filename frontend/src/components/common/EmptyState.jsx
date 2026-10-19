import { Sparkles } from "lucide-react";
import Card from "./Card.jsx";

export default function EmptyState({ title, description, action }) {
  return (
    <Card className="grid place-items-center py-14 text-center">
      <div className="mb-4 rounded-3xl bg-white/10 p-4 text-neon-blue">
        <Sparkles size={32} />
      </div>

      <h3 className="text-xl font-bold">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-slate-400">{description}</p>

      {action && <div className="mt-6">{action}</div>}
    </Card>
  );
}
