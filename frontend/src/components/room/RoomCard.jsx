
import { Link } from "react-router-dom";
import Button from "../common/Button.jsx";

export default function RoomCard({ room }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-glow transition hover:shadow-purpleGlow">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-sm text-slate-400">{room.visibility?.toUpperCase() || "PUBLIC"}</p>
          <h3 className="text-xl font-semibold text-white">{room.topic || "Untitled discussion"}</h3>
        </div>
        <span className="rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-400">{room.status || "waiting"}</span>
      </div>
      <p className="text-sm leading-6 text-slate-300">Host: {room.creatorName || "Host"}</p>
      <div className="mt-4 flex items-center justify-between gap-4 text-sm text-slate-400">
        <span>{room.participants?.length || 0}/{room.participantLimit || 8} joined</span>
        <span>{room.timerMinutes || 15} min</span>
      </div>
      <div className="mt-6 text-right">
        <Link to={`/rooms/${room.id}`}>
          <Button variant="secondary">Open room</Button>
        </Link>
      </div>
    </div>
  );
}

