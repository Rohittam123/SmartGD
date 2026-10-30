import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import Button from "../../components/common/Button.jsx";
import Input from "../../components/common/Input.jsx";
import { db } from "../../config/firebase.js";
import { loginWithEmail, logout } from "../../services/authService.js";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);

    try {
      const user = await loginWithEmail({ email, password });
      if (!user.emailVerified) {
        toast.error("Verify your email before continuing.");
        navigate("/verify-email", { replace: true, state: { from: { pathname: "/admin" } } });
        return;
      }

      const profileSnapshot = await getDoc(doc(db, "users", user.uid));
      if (!profileSnapshot.exists() || profileSnapshot.data().role !== "admin") {
        await logout();
        toast.error("This account does not have admin access.");
        return;
      }

      toast.success("Admin sign-in successful.");
      navigate(location.state?.from?.pathname || "/admin", { replace: true });
    } catch (error) {
      console.error("Admin sign-in failed:", error);
      toast.error(error.message || "Unable to sign in as admin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-4 py-16">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-glow sm:p-10">
        <div className="mb-6 grid h-14 w-14 place-items-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
          <ShieldCheck size={26} />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">Admin portal</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Admin sign in</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Use your existing Smart GD account. Access is granted only to verified accounts with the admin role.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <Input label="Email address" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" placeholder="admin@example.com" />
          <Input label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" placeholder="Enter your password" />
          <Button type="submit" loading={loading} className="w-full">Sign in to admin</Button>
        </form>

        <div className="mt-6 flex justify-between gap-3 text-sm">
          <Link to="/forgot-password" className="text-neon-blue hover:underline">Forgot password?</Link>
          <Link to="/login" className="text-neon-blue hover:underline">Regular sign in</Link>
        </div>

        <div className="mt-7 rounded-2xl border border-white/[0.08] bg-slate-950/50 p-4 text-xs leading-5 text-slate-400">
          <p className="font-medium text-slate-200">Setting up the first admin?</p>
          <p className="mt-1">
            <Link to="/register" className="text-cyan-200 hover:underline">Create a regular account</Link>, verify its email, then set its Firestore <code className="text-slate-200">users/{`{uid}`}.role</code> field to <code className="text-slate-200">admin</code>. Existing admins can promote users from the dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
