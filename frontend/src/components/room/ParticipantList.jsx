
import Card from "../common/Card.jsx";

export default function ParticipantList({ participants = [] }) {
  return (
    <Card className="space-y-4 p-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Participants</h2>
        <p className="text-sm text-slate-400">People currently in the room.</p>
      </div>
      <div className="space-y-3">
        {participants.length === 0 ? (
          <p className="text-sm text-slate-400">No participants have joined yet.</p>
        ) : (
          participants.map((participant) => (
            <div key={participant} className="flex items-center justify-between rounded-3xl border border-white/10 bg-slate-950/80 p-4">
              <div>
                <p className="font-medium text-white">{participant}</p>
                <p className="text-sm text-slate-500">User ID</p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

