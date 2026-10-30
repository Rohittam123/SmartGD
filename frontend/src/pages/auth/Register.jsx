
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../../components/common/Button.jsx";
import Input from "../../components/common/Input.jsx";
import { registerWithEmail } from "../../services/authService.js";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);

    try {
      await registerWithEmail({ name, email, password });
      toast.success("Verification email sent. Verify your address to finish creating your account.");
      navigate("/verify-email", { replace: true });
    } catch (error) {
      toast.error(error.message || "Unable to create account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-4 py-16">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/5 p-10 shadow-glow">
        <h1 className="text-3xl font-semibold text-white">Create account</h1>
        <p className="mt-3 text-sm text-slate-400">Verify your email first, then complete your profile to get started.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <Input label="Full name" value={name} onChange={(event) => setName(event.target.value)} required placeholder="Jane Doe" />
          <Input label="Email address" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="you@example.com" />
          <Input label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required placeholder="Create a strong password" />
          <Button type="submit" loading={loading} className="w-full">Register</Button>
        </form>

        <p className="mt-6 text-sm text-slate-400">
          Already have an account? <Link to="/login" className="text-neon-blue hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
