import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MailCheck, RefreshCw, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../../components/common/Button.jsx";
import Loader from "../../components/common/Loader.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { logout, resendVerificationEmail } from "../../services/authService.js";

export default function VerifyEmail() {
  const { firebaseUser, profile, isEmailVerified, authLoading, refreshEmailVerification } = useAuth();
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (authLoading) {
    return <Loader fullScreen label="Checking your account..." />;
  }

  async function handleResend() {
    if (!firebaseUser) return;

    setSending(true);
    try {
      await resendVerificationEmail(firebaseUser);
      toast.success("Verification email sent. Check your inbox and spam folder.");
    } catch (error) {
      console.error("Unable to resend verification email:", error);
      toast.error(error.message || "Unable to send the verification email.");
    } finally {
      setSending(false);
    }
  }

  async function handleContinue() {
    setChecking(true);
    try {
      const verified = isEmailVerified || await refreshEmailVerification();
      if (!verified) {
        toast.error("Email not verified yet. Open the link in your inbox, then try again.");
        return;
      }

      toast.success("Email verified. Welcome to Smart GD!");
      navigate(
        profile?.username ? location.state?.from?.pathname || "/dashboard" : "/complete-profile",
        { replace: true }
      );
    } catch (error) {
      console.error("Unable to refresh email verification status:", error);
      toast.error(error.message || "Unable to check verification status. Please try again.");
    } finally {
      setChecking(false);
    }
  }

  async function handleSignOut() {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Unable to sign out from the verification screen:", error);
      toast.error(error.message || "Unable to sign out.");
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-4 py-12">
      <section className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-white/[0.05] p-7 shadow-glow sm:p-10">
        <div className="mb-7 grid h-14 w-14 place-items-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
          {isEmailVerified ? <ShieldCheck size={26} /> : <MailCheck size={26} />}
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
          Account security
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white">
          {isEmailVerified ? "Email verified" : "Verify your email"}
        </h1>
        <p className="mt-3 leading-7 text-slate-400">
          {firebaseUser
            ? <>We sent a verification link to <span className="font-medium text-slate-200">{firebaseUser.email}</span>. Open it, then return here to continue.</>
            : "Sign in to the account you want to verify. If you already opened the verification link, signing in will refresh your access."}
        </p>

        {firebaseUser ? (
          <div className="mt-8 space-y-3">
            {!isEmailVerified && (
              <Button type="button" onClick={handleResend} loading={sending} className="w-full">
                Resend verification email
              </Button>
            )}
            <Button
              type="button"
              variant="secondary"
              onClick={handleContinue}
              loading={checking}
              className="w-full"
            >
              <RefreshCw size={17} />
              {isEmailVerified ? "Continue to Smart GD" : "I have verified my email"}
            </Button>
            <button type="button" onClick={handleSignOut} className="w-full py-2 text-sm text-slate-400 transition hover:text-white">
              Sign out and use another account
            </button>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            <Link to="/login" className="block rounded-2xl bg-white px-5 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-100">
              Go to sign in
            </Link>
            <p className="text-center text-sm text-slate-500">
              New to Smart GD? <Link to="/register" className="text-cyan-200 hover:underline">Create an account</Link>
            </p>
          </div>
        )}

        <p className="mt-7 border-t border-white/[0.08] pt-5 text-xs leading-5 text-slate-500">
          Didn&apos;t receive the email? Check your spam folder or request a new link. Verification links are sent by Firebase Authentication.
        </p>
      </section>
    </div>
  );
}
