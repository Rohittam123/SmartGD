
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../../components/common/Button.jsx";
import Card from "../../components/common/Card.jsx";
import Input from "../../components/common/Input.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { notifyAllUsersAboutRoom } from "../../services/notificationService.js";
import { createRoom } from "../../services/roomService.js";

export default function CreateRoom() {
  const [topic, setTopic] = useState("");
  const [timerMinutes, setTimerMinutes] = useState(15);
  const [participantLimit, setParticipantLimit] = useState(8);
  const [visibility, setVisibility] = useState("public");
  const [loading, setLoading] = useState(false);
  const { profile, firebaseUser } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);

    try {
      const roomRef = await createRoom({
        topic,
        timerMinutes,
        participantLimit,
        visibility,
        createdBy: firebaseUser.uid,
        creatorName: profile?.name || "Host"
      });

      toast.success("Room created successfully.");
      navigate(`/rooms/${roomRef.id}`);

      notifyAllUsersAboutRoom({
        roomId: roomRef.id,
        roomCode: roomRef.code,
        topic,
        creatorName: profile?.name || "Host"
      }).catch((notifyError) => {
        console.error("Room notification failed", notifyError);
      });
    } catch (error) {
      toast.error(error.message || "Unable to create room.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
      <div>
        <h1 className="text-3xl font-semibold text-white">Create a new discussion room</h1>
        <p className="mt-3 text-slate-400">Set your discussion topic, duration, and visibility.</p>
        <Card className="mt-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input label="Discussion topic" value={topic} onChange={(event) => setTopic(event.target.value)} required placeholder="Example: The future of remote learning" />
            <div className="grid gap-4 md:grid-cols-3">
              <Input label="Timer (minutes)" type="number" value={timerMinutes} onChange={(event) => setTimerMinutes(Number(event.target.value))} min={5} max={60} />
              <Input label="Participant limit" type="number" value={participantLimit} onChange={(event) => setParticipantLimit(Number(event.target.value))} min={2} max={20} />
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Visibility</label>
                <select
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-neon-blue focus:ring-4 focus:ring-neon-blue/10"
                  value={visibility}
                  onChange={(event) => setVisibility(event.target.value)}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>
            <Button type="submit" loading={loading}>Create room</Button>
          </form>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="space-y-4 p-6">
          <h2 className="text-xl font-semibold text-white">Room tips</h2>
          <ul className="space-y-3 text-sm text-slate-400">
            <li>Choose a clear topic to guide the discussion.</li>
            <li>Keep groups small for better participation.</li>
            <li>Use the moderator controls to manage the flow.</li>
          </ul>
        </Card>
        <Card className="space-y-4 p-6">
          <h2 className="text-xl font-semibold text-white">Your details</h2>
          <p className="text-slate-400">Host: {profile?.name || "Loading..."}</p>
          <p className="text-slate-400">College: {profile?.college || "Not specified"}</p>
        </Card>
      </div>
    </div>
  );
}

