
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  FileText,
  Pencil,
  Radio,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  X
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth.js";
import {
  deleteAdminReport,
  deleteAdminRoom,
  deleteAdminUser,
  getAdminMetrics,
  listenToAdminData,
  updateAdminRoom,
  updateAdminUser
} from "../../services/adminService.js";

const sections = ["Overview", "Users", "Rooms", "Reports"];

function formatDate(value) {
  if (!value) return "-";
  const date = value.toDate ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
}

function StatCard({ label, value, icon: Icon, detail }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{value ?? "-"}</p>
          <p className="mt-2 text-xs text-slate-500">{detail}</p>
        </div>
        <span className="rounded-2xl border border-cyan-300/10 bg-cyan-300/10 p-3 text-cyan-200">
          <Icon size={20} />
        </span>
      </div>
    </article>
  );
}

function ActionButton({ label, children, onClick, danger = false, disabled = false }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl border p-2 transition disabled:cursor-not-allowed disabled:opacity-40 ${
        danger
          ? "border-rose-400/20 text-rose-300 hover:bg-rose-400/10"
          : "border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

export default function AdminPanel() {
  const { profile, firebaseUser } = useAuth();
  const [section, setSection] = useState("Overview");
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [reports, setReports] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const refreshMetrics = useCallback(async () => {
    setRefreshing(true);
    try {
      const nextMetrics = await getAdminMetrics();
      setMetrics(nextMetrics);
      setError("");
    } catch (loadError) {
      console.error("Unable to load admin metrics:", loadError);
      setError(loadError.message || "Unable to load system metrics.");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = listenToAdminData({
      onUsers: setUsers,
      onRooms: setRooms,
      onReports: setReports,
      onError: (loadError) => {
        console.error("Unable to monitor admin data:", loadError);
        setError(loadError.message || "Unable to load admin data.");
        setLoading(false);
      }
    });

    refreshMetrics();
    const intervalId = window.setInterval(refreshMetrics, 60_000);

    return () => {
      unsubscribe();
      window.clearInterval(intervalId);
    };
  }, [refreshMetrics]);

  const normalizedSearch = search.trim().toLowerCase();
  const filteredUsers = useMemo(
    () => users.filter((user) =>
      [user.name, user.username, user.email, user.id]
        .some((value) => String(value || "").toLowerCase().includes(normalizedSearch))
    ),
    [users, normalizedSearch]
  );
  const filteredRooms = useMemo(
    () => rooms.filter((room) =>
      [room.topic, room.creatorName, room.code, room.id]
        .some((value) => String(value || "").toLowerCase().includes(normalizedSearch))
    ),
    [rooms, normalizedSearch]
  );
  const filteredReports = useMemo(
    () => reports.filter((report) =>
      [report.topic, report.userId, report.id]
        .some((value) => String(value || "").toLowerCase().includes(normalizedSearch))
    ),
    [reports, normalizedSearch]
  );

  function askToDelete(message) {
    return window.confirm(message);
  }

  async function handleSave(event) {
    event.preventDefault();
    if (!editing || !firebaseUser?.uid) return;

    const formData = new FormData(event.currentTarget);
    setSaving(true);
    try {
      if (editing.type === "user") {
        const name = String(formData.get("name") || "").trim();
        const role = editing.item.id === firebaseUser.uid
          ? editing.item.role
          : String(formData.get("role") || "user");
        if (!name) {
          toast.error("A user name is required.");
          return;
        }
        await updateAdminUser(firebaseUser.uid, editing.item.id, { name, role });
      } else {
        const topic = String(formData.get("topic") || "").trim();
        const status = String(formData.get("status") || "waiting");
        if (topic.length < 5 || topic.length > 180) {
          toast.error("Room topics must be between 5 and 180 characters.");
          return;
        }
        await updateAdminRoom(firebaseUser.uid, editing.item.id, { topic, status });
      }

      toast.success(`${editing.type === "user" ? "User" : "Room"} updated.`);
      setEditing(null);
    } catch (saveError) {
      console.error("Unable to save admin changes:", saveError);
      toast.error(saveError.message || "Unable to save changes.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(type, item) {
    if (!firebaseUser?.uid) return;
    const messages = {
      user: `Delete the Firestore profile and username for ${item.name || item.username || item.id}? Their Firebase Authentication account will not be deleted.`,
      room: `Delete the room "${item.topic || item.code || item.id}" and its messages, signals, and transcripts?`,
      report: "Permanently delete this AI report?"
    };
    if (!askToDelete(messages[type])) return;

    try {
      if (type === "user") await deleteAdminUser(firebaseUser.uid, item);
      if (type === "room") await deleteAdminRoom(firebaseUser.uid, item.id);
      if (type === "report") await deleteAdminReport(firebaseUser.uid, item.id);
      toast.success(`${type === "user" ? "User profile" : type === "room" ? "Room" : "Report"} deleted.`);
      refreshMetrics();
    } catch (deleteError) {
      console.error(`Unable to delete admin ${type}:`, deleteError);
      toast.error(deleteError.message || `Unable to delete ${type}.`);
    }
  }

  return (
    <div className="mx-auto max-w-[1440px] space-y-7 pb-10">
      <header className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-400/[0.09] via-white/[0.03] to-violet-400/[0.08] p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-medium text-emerald-200">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
            SYSTEM MONITOR
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Admin control center
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Welcome, {profile?.name || "Admin"}. Monitor activity and manage platform records.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-300">
            <ShieldCheck size={17} className="text-cyan-200" />
            Admin access enabled
          </span>
          <button
            type="button"
            onClick={refreshMetrics}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100 disabled:opacity-60"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </header>

      {error && (
        <div role="alert" className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
          Could not fully load admin data: {error}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="System metrics">
        <StatCard label="Total users" value={metrics?.users} detail="Registered profiles" icon={Users} />
        <StatCard label="Total rooms" value={metrics?.rooms} detail="Discussion rooms" icon={Radio} />
        <StatCard label="Live rooms" value={metrics?.activeRooms} detail="Currently in progress" icon={Activity} />
        <StatCard label="AI reports" value={metrics?.reports} detail="Generated feedback reports" icon={FileText} />
      </section>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035]">
        <div className="flex flex-col gap-4 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <nav aria-label="Admin sections" className="flex gap-1 overflow-x-auto">
            {sections.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setSection(item)}
                className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                  section === item
                    ? "bg-white text-slate-950"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
          {section !== "Overview" && (
            <label className="relative block w-full sm:max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={`Search ${section.toLowerCase()}...`}
                className="w-full rounded-xl border border-white/10 bg-slate-950/70 py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/40"
              />
            </label>
          )}
        </div>

        {section === "Overview" ? (
          <div className="grid gap-4 p-4 lg:grid-cols-3 lg:p-6">
            <OverviewCard
              title="User directory"
              count={metrics?.users}
              detail={`${users.length} latest profiles loaded`}
              icon={Users}
              onClick={() => setSection("Users")}
            />
            <OverviewCard
              title="Discussion rooms"
              count={metrics?.rooms}
              detail={`${rooms.filter((room) => room.status === "live").length} live now`}
              icon={Radio}
              onClick={() => setSection("Rooms")}
            />
            <OverviewCard
              title="AI reports"
              count={metrics?.reports}
              detail={`${reports.length} latest reports loaded`}
              icon={FileText}
              onClick={() => setSection("Reports")}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            {section === "Users" && (
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-white/[0.025] text-xs uppercase tracking-wide text-slate-500">
                  <tr><th className="px-6 py-4 font-medium">User</th><th className="px-4 py-4 font-medium">Role</th><th className="px-4 py-4 font-medium">Joined</th><th className="px-6 py-4 text-right font-medium">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="text-slate-300">
                      <td className="px-6 py-4">
                        <p className="font-medium text-white">{user.name || "Unnamed user"}</p>
                        <p className="mt-1 text-xs text-slate-500">{user.username ? `@${user.username}` : user.email || user.id}</p>
                      </td>
                      <td className="px-4 py-4"><RoleBadge role={user.role} /></td>
                      <td className="px-4 py-4 text-slate-400">{formatDate(user.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <ActionButton label="Edit user" onClick={() => setEditing({ type: "user", item: user })}><Pencil size={16} /></ActionButton>
                          <ActionButton
                            label={user.id === firebaseUser?.uid ? "Cannot delete your own profile" : "Delete user profile"}
                            danger
                            disabled={user.id === firebaseUser?.uid}
                            onClick={() => handleDelete("user", user)}
                          >
                            <Trash2 size={16} />
                          </ActionButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {section === "Rooms" && (
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-white/[0.025] text-xs uppercase tracking-wide text-slate-500">
                  <tr><th className="px-6 py-4 font-medium">Room</th><th className="px-4 py-4 font-medium">Host</th><th className="px-4 py-4 font-medium">Status</th><th className="px-4 py-4 font-medium">Participants</th><th className="px-6 py-4 text-right font-medium">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {filteredRooms.map((room) => (
                    <tr key={room.id} className="text-slate-300">
                      <td className="px-6 py-4"><p className="max-w-sm truncate font-medium text-white">{room.topic || "Untitled room"}</p><p className="mt-1 text-xs text-slate-500">{room.code || room.id}</p></td>
                      <td className="px-4 py-4">{room.creatorName || room.createdBy || "-"}</td>
                      <td className="px-4 py-4"><StatusBadge status={room.status} /></td>
                      <td className="px-4 py-4">{room.participants?.length || 0}/{room.participantLimit || "-"}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <ActionButton label="Edit room" onClick={() => setEditing({ type: "room", item: room })}><Pencil size={16} /></ActionButton>
                          <ActionButton label="Delete room" danger onClick={() => handleDelete("room", room)}><Trash2 size={16} /></ActionButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {section === "Reports" && (
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead className="bg-white/[0.025] text-xs uppercase tracking-wide text-slate-500">
                  <tr><th className="px-6 py-4 font-medium">Report</th><th className="px-4 py-4 font-medium">User ID</th><th className="px-4 py-4 font-medium">Created</th><th className="px-6 py-4 text-right font-medium">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="text-slate-300">
                      <td className="px-6 py-4"><p className="font-medium text-white">{report.topic || "Discussion report"}</p><p className="mt-1 text-xs text-slate-500">ID: {report.id}</p></td>
                      <td className="px-4 py-4 font-mono text-xs">{report.userId || "-"}</td>
                      <td className="px-4 py-4 text-slate-400">{formatDate(report.createdAt)}</td>
                      <td className="px-6 py-4"><div className="flex justify-end"><ActionButton label="Delete report" danger onClick={() => handleDelete("report", report)}><Trash2 size={16} /></ActionButton></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {loading && <p className="px-6 py-8 text-sm text-slate-400">Loading admin data...</p>}
            {!loading && (
              (section === "Users" && filteredUsers.length === 0)
              || (section === "Rooms" && filteredRooms.length === 0)
              || (section === "Reports" && filteredReports.length === 0)
            ) && <p className="px-6 py-10 text-center text-sm text-slate-500">No matching records found.</p>}
            <p className="border-t border-white/[0.06] px-6 py-3 text-xs text-slate-500">
              Showing the latest {ADMIN_LIST_LIMIT} records in this list. Counts above include all records.
            </p>
          </div>
        )}
      </section>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !saving) setEditing(null);
        }}>
          <form onSubmit={handleSave} className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Admin edit</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Update {editing.type}</h2>
              </div>
              <button type="button" aria-label="Close edit form" disabled={saving} onClick={() => setEditing(null)} className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white"><X size={18} /></button>
            </div>
            {editing.type === "user" ? (
              <div className="space-y-4">
                <label className="block text-sm text-slate-300">
                  Display name
                  <input name="name" defaultValue={editing.item.name || ""} maxLength={80} required className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-300/40" />
                </label>
                <label className="block text-sm text-slate-300">
                  Account role
                  <select name="role" defaultValue={editing.item.role || "user"} disabled={editing.item.id === firebaseUser?.uid} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-300/40 disabled:opacity-60">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>
                {editing.item.id === firebaseUser?.uid && <p className="text-xs text-amber-200">Your own admin role is protected from changes here.</p>}
              </div>
            ) : (
              <div className="space-y-4">
                <label className="block text-sm text-slate-300">
                  Discussion topic
                  <input name="topic" defaultValue={editing.item.topic || ""} minLength={5} maxLength={180} required className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-300/40" />
                </label>
                <label className="block text-sm text-slate-300">
                  Room status
                  <select name="status" defaultValue={editing.item.status || "waiting"} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-300/40">
                    <option value="waiting">Waiting</option>
                    <option value="live">Live</option>
                    <option value="ended">Ended</option>
                  </select>
                </label>
              </div>
            )}
            <div className="mt-7 flex justify-end gap-3">
              <button type="button" disabled={saving} onClick={() => setEditing(null)} className="rounded-xl px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5">Cancel</button>
              <button type="submit" disabled={saving} className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-100 disabled:opacity-60">{saving ? "Saving..." : "Save changes"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

const ADMIN_LIST_LIMIT = 100;

function OverviewCard({ title, count, detail, icon: Icon, onClick }) {
  return (
    <button type="button" onClick={onClick} className="group rounded-2xl border border-white/[0.08] bg-slate-950/50 p-5 text-left transition hover:border-cyan-200/20 hover:bg-white/[0.04]">
      <div className="flex items-center justify-between">
        <span className="rounded-xl bg-white/[0.06] p-2.5 text-cyan-200"><Icon size={18} /></span>
        <span className="text-2xl font-semibold text-white">{count ?? "-"}</span>
      </div>
      <p className="mt-5 font-medium text-white">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{detail}</p>
    </button>
  );
}

function RoleBadge({ role }) {
  const isAdmin = role === "admin";
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${isAdmin ? "bg-violet-300/10 text-violet-200" : "bg-slate-300/10 text-slate-300"}`}>
      {isAdmin ? "Admin" : "User"}
    </span>
  );
}

function StatusBadge({ status }) {
  const color = status === "live"
    ? "bg-emerald-300/10 text-emerald-200"
    : status === "ended"
      ? "bg-slate-300/10 text-slate-300"
      : "bg-amber-300/10 text-amber-200";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${color}`}>{status || "unknown"}</span>;
}
