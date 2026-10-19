
import { Bell, LogOut, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth.js";
import { useNotifications } from "../../hooks/useNotifications.js";
import { logout } from "../../services/authService.js";

export default function Topbar() {
  const { profile } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      toast.success("Logged out successfully.");
      navigate("/login");
    } catch (error) {
      toast.error(error.message || "Unable to log out.");
    }
  }

  return (
    <header className="flex items-center justify-between gap-4 border-b border-white/10 bg-slate-950/90 px-6 py-4 text-slate-200 backdrop-blur-xl">
      <div>
        <p className="text-sm text-slate-400">Good to see you,</p>
        <h1 className="text-lg font-semibold text-white">{profile?.name || "Smart GD User"}</h1>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative rounded-3xl border border-white/10 bg-white/5 p-3 text-slate-300 transition hover:bg-white/10">
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-400 px-1.5 text-[11px] font-semibold text-white">
              {unreadCount}
            </span>
          )}
        </button>
        <button type="button" onClick={() => navigate("/profile")} className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 transition hover:bg-white/10">
          <Settings className="mr-2 inline-block" size={16} />
          Profile
        </button>
        <button type="button" onClick={handleLogout} className="rounded-3xl border border-white/10 bg-red-500/10 px-4 py-3 text-sm text-rose-200 transition hover:bg-red-500/15">
          <LogOut className="mr-2 inline-block" size={16} />
          Logout
        </button>
      </div>
    </header>
  );
}

