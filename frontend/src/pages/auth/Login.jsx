
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../../components/common/Button.jsx";
import Input from "../../components/common/Input.jsx";
import { loginWithEmail } from "../../services/authService.js";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);

    try {
      const user = await loginWithEmail({ email, password });
      if (!user.emailVerified) {
        toast.error("Verify your email before continuing.");
        navigate("/verify-email", { replace: true });
        return;
      }

      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-4 py-16">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/5 p-10 shadow-glow">
        <h1 className="text-3xl font-semibold text-white">Welcome back</h1>
        <p className="mt-3 text-sm text-slate-400">Sign in to continue to your GD dashboard.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <Input label="Email address" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="you@example.com" />
          <Input label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required placeholder="Enter your password" />
          <Button type="submit" loading={loading} className="w-full">Login</Button>
        </form>

        <div className="mt-6 flex flex-col gap-3 text-sm text-slate-400 sm:flex-row sm:justify-between">
          <Link to="/forgot-password" className="text-neon-blue hover:underline">Forgot password?</Link>
          <Link to="/register" className="text-neon-blue hover:underline">Create an account</Link>
        </div>
      </div>
    </div>
  );
}
