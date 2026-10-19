
import Card from "../common/Card.jsx";

export default function Timer({ minutes = 15, status = "waiting" }) {
  return (
    <Card className="space-y-4 p-6 text-center">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Timer</p>
      <p className="text-5xl font-semibold text-white">{minutes}m</p>
      <p className="text-sm text-slate-400">Status: {status}</p>
    </Card>
  );
}

