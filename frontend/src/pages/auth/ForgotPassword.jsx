
import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../../components/common/Button.jsx";
import Input from "../../components/common/Input.jsx";
import { resetPassword } from "../../services/authService.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      await resetPassword(email);
      toast.success("Password reset email sent.");
    } catch (error) {
      toast.error(error.message || "Unable to send reset email.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-4 py-16">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/5 p-10 shadow-glow">
        <h1 className="text-3xl font-semibold text-white">Reset password</h1>
        <p className="mt-3 text-sm text-slate-400">Enter your email address and we will send password reset instructions.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <Input
            label="Email address"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            placeholder="you@example.com"
          />
          <Button type="submit" loading={submitting} className="w-full">Send reset link</Button>
        </form>

        <p className="mt-6 text-sm text-slate-400">
          Remembered your password? <Link to="/login" className="text-neon-blue hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}

