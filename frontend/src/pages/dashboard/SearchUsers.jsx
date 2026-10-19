import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, UserCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../../components/common/Button.jsx";
import Card from "../../components/common/Card.jsx";
import Input from "../../components/common/Input.jsx";
import { searchUsersByUsername } from "../../services/userService.js";

export default function SearchUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(event) {
    event.preventDefault();
    if (searchTerm.trim().replace(/^@/, "").length < 2) {
      toast.error("Enter at least 2 characters to search.");
      return;
    }

    setLoading(true);
    try {
      setUsers(await searchUsersByUsername(searchTerm));
      setSearched(true);
    } catch (error) {
      toast.error(error.message || "Unable to search users.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-8">
        <h1 className="text-3xl font-semibold text-white">Find users</h1>
        <p className="mt-3 text-slate-400">Search by username to view a member's profile and discussion performance.</p>
        <form onSubmit={handleSearch} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Input label="Username" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search usernames, e.g. riya" />
          <Button type="submit" loading={loading} className="self-end">
            <span className="inline-flex items-center gap-2"><Search size={16} />Search</span>
          </Button>
        </form>
      </Card>

      {searched && users.length === 0 && (
        <p className="rounded-3xl border border-white/10 bg-white/5 p-6 text-slate-400">No users found. Try another username.</p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {users.map((user) => (
          <Card key={user.id} className="p-6">
            <div className="flex items-center gap-4">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="h-14 w-14 rounded-full object-cover" />
              ) : (
                <UserCircle2 size={48} className="text-slate-400" />
              )}
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold text-white">{user.name || "Smart GD User"}</h2>
                <p className="text-sm text-neon-blue">@{user.username}</p>
                <p className="mt-1 truncate text-sm text-slate-400">{user.college || "College not provided"}</p>
              </div>
            </div>
            <p className="mt-4 line-clamp-2 text-sm text-slate-400">{user.bio || "No bio yet."}</p>
            <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
              <span>Average score: {user.averageScore || 0}</span>
              <Link to={`/users/${user.username}`} className="text-neon-blue hover:underline">View profile</Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
