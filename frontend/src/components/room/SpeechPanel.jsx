
import Card from "../common/Card.jsx";

export default function SpeechPanel({ activeSpeaker }) {
  return (
    <Card className="space-y-4 p-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Speech panel</h2>
        <p className="text-sm text-slate-400">Current speaker and speaking queue.</p>
      </div>
      <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 text-center">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Active speaker</p>
        <p className="mt-4 text-2xl font-semibold text-white">{activeSpeaker || "No one yet"}</p>
      </div>
    </Card>
  );
}

