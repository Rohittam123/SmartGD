import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Card from "../../components/common/Card.jsx";
import Loader from "../../components/common/Loader.jsx";
import { getUserByUsername } from "../../services/userService.js";

export default function PublicUserProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(null);
    getUserByUsername(username)
      .then((user) => {
        if (active) setProfile(user);
      })
      .catch((error) => {
        if (active) setLoadError(error.message || "Unable to load this profile.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [username]);

  if (loading) return <Loader fullScreen label="Loading profile..." />;
  if (loadError) return <p className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-red-300">{loadError}</p>;
  if (!profile) {
    return (
      <Card className="p-8">
        <h1 className="text-2xl font-semibold text-white">User not found</h1>
        <Link to="/users" className="mt-4 inline-block text-neon-blue hover:underline">Back to search</Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          {profile.photoURL && <img src={profile.photoURL} alt="" className="h-20 w-20 rounded-full object-cover" />}
          <div>
            <p className="text-sm text-neon-blue">@{profile.username}</p>
            <h1 className="mt-1 text-3xl font-semibold text-white">{profile.name || "Smart GD User"}</h1>
            <p className="mt-2 text-slate-400">{profile.college || "College not provided"}</p>
          </div>
        </div>
        <p className="mt-6 whitespace-pre-wrap text-slate-300">{profile.bio || "No bio provided."}</p>
      </Card>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-6"><p className="text-sm text-slate-400">Average performance score</p><p className="mt-2 text-3xl font-semibold text-white">{profile.averageScore || 0}</p></Card>
        <Card className="p-6"><p className="text-sm text-slate-400">Sessions completed</p><p className="mt-2 text-3xl font-semibold text-white">{profile.totalSessions || 0}</p></Card>
        <Card className="p-6"><p className="text-sm text-slate-400">Rank</p><p className="mt-2 text-3xl font-semibold text-white">{profile.rank || "—"}</p></Card>
      </div>
      <Link to="/users" className="inline-block text-neon-blue hover:underline">Back to user search</Link>
    </div>
  );
}
