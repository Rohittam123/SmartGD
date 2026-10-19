
import { NavLink } from "react-router-dom";
import { Compass, Home, Layers, ListChecks, MessageCircle, Search, Sparkles, Trophy, UserCircle2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";

const links = [
  { label: "Overview", to: "/dashboard", icon: Home },
  { label: "Rooms", to: "/rooms/create", icon: Layers },
  { label: "Join Room", to: "/rooms/join", icon: Compass },
  { label: "Leaderboard", to: "/leaderboard", icon: Trophy },
  { label: "Find users", to: "/users", icon: Search },
  { label: "Practice", to: "/practice", icon: Sparkles },
  { label: "Mentor", to: "/mentor", icon: MessageCircle },
  { label: "Notifications", to: "/notifications", icon: ListChecks },
  { label: "Profile", to: "/profile", icon: UserCircle2 }
];

export default function Sidebar() {
  const { profile } = useAuth();

  return (
    <aside className="min-h-screen border-r border-white/10 bg-slate-950/90 p-6 text-slate-300">
      <div className="mb-10">
        <div className="mb-4 rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Smart GD</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Dashboard</h2>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-950/90 p-4">
          <p className="text-sm text-slate-400">Welcome back,</p>
          <p className="mt-2 text-lg font-semibold text-white">{profile?.name || "Guest"}</p>
        </div>
      </div>

      <nav className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive ? "bg-white/10 text-white shadow-glow" : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Icon size={18} />
              {link.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
