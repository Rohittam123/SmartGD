import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../../components/common/Button.jsx";
import Input from "../../components/common/Input.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { claimUsername } from "../../services/userService.js";
import { DEFAULT_AVATAR, USER_ROLES } from "../../utils/constants.js";

export default function CompleteProfile() {
  const { firebaseUser, isEmailVerified, profile, authLoading } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [college, setCollege] = useState("");
  const [loading, setLoading] = useState(false);

  if (authLoading) {
    return <div className="grid min-h-screen place-items-center text-slate-300">Loading account...</div>;
  }
  if (!firebaseUser) {
    return <Navigate to="/login" replace />;
  }
  if (!isEmailVerified) {
    return <Navigate to="/verify-email" replace />;
  }
  if (profile?.username) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      await claimUsername(firebaseUser.uid, username, {
        name: profile?.name || firebaseUser.displayName || "Smart GD User",
        email: firebaseUser.email,
        photoURL: profile?.photoURL || firebaseUser.photoURL || DEFAULT_AVATAR,
        role: profile?.role || USER_ROLES.USER,
        bio: profile?.bio || "",
        college,
        totalSessions: profile?.totalSessions || 0,
        averageScore: profile?.averageScore || 0,
        rank: profile?.rank || 0
      });
      toast.success("Username saved. Welcome to Smart GD!");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(error.message || "Unable to save username.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-4 py-16">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/5 p-10 shadow-glow">
        <h1 className="text-3xl font-semibold text-white">Choose a username</h1>
        <p className="mt-3 text-sm text-slate-400">Your email is verified. Complete your profile to start using the platform.</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <Input label="College / Institution" value={college} onChange={(event) => setCollege(event.target.value)} placeholder="Your college name" />
          <Input label="Username" value={username} onChange={(event) => setUsername(event.target.value.toLowerCase())} required minLength={3} maxLength={20} pattern="[A-Za-z0-9_]{3,20}" placeholder="your_username" />
          <p className="-mt-3 text-xs text-slate-500">3-20 letters, numbers, or underscores. Usernames cannot be changed.</p>
          <Button type="submit" loading={loading} className="w-full">Continue</Button>
        </form>
      </div>
    </div>
  );
}
