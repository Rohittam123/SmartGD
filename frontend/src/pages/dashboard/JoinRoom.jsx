
import { usePublicRooms } from "../../hooks/useRooms.js";
import RoomCard from "../../components/room/RoomCard.jsx";
import Loader from "../../components/common/Loader.jsx";

export default function JoinRoom() {
  const { rooms, loading } = usePublicRooms();

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-glow">
        <h1 className="text-3xl font-semibold text-white">Join an open room</h1>
        <p className="mt-3 text-slate-400">Browse public discussion rooms and jump into a session.</p>
      </div>

      {loading ? (
        <Loader label="Loading available rooms..." />
      ) : rooms.length === 0 ? (
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-slate-400">No public rooms are available right now. Try creating a new room instead.</div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </div>
  );
}

