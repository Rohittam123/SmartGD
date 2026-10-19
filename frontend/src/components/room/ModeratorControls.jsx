
import Button from "../common/Button.jsx";

export default function ModeratorControls({ isHost, room, onStart, onEnd, onRaiseHand, onLowerHand, onSetSpeaker }) {
  if (!isHost) {
    return null;
  }

  return (
    <section className="space-y-4 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-glow">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Moderator controls</h2>
          <p className="text-sm text-slate-400">Manage the room flow and keep conversation moving.</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Button onClick={onStart} disabled={room?.status === "live"}>Start session</Button>
        <Button variant="secondary" onClick={onEnd} disabled={room?.status !== "live"}>End session</Button>
        <Button variant="ghost" onClick={onRaiseHand}>Raise hand queue</Button>
        <Button variant="ghost" onClick={onLowerHand}>Clear raised hands</Button>
      </div>
      <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-sm text-slate-300">
        Active speaker: {room?.activeSpeaker || "Not selected"}
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Button variant="secondary" onClick={onSetSpeaker}>Use host as speaker</Button>
        </div>
      </div>
    </section>
  );
}

