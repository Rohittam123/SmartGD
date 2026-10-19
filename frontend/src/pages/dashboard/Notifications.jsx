
import { useNotifications } from "../../hooks/useNotifications.js";
import Card from "../../components/common/Card.jsx";
import { formatDate } from "../../utils/helpers.js";

export default function Notifications() {
  const { notifications } = useNotifications();

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-glow">
        <h1 className="text-3xl font-semibold text-white">Notifications</h1>
        <p className="mt-3 text-slate-400">Recent updates and activity from your sessions.</p>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card className="p-8 text-center text-slate-400">No notifications yet. Check back after your next session.</Card>
        ) : (
          notifications.map((notification) => (
            <Card key={notification.id} className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-white">{notification.title || "Notification"}</p>
                  <p className="mt-2 text-sm text-slate-400">{notification.body || notification.message}</p>
                </div>
                <span className="text-xs uppercase tracking-[0.2em] text-slate-500">{formatDate(notification.createdAt)}</span>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

