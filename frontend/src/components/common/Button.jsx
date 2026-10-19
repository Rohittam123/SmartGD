import { Loader2 } from "lucide-react";
import { cx } from "../../utils/helpers.js";

const variants = {
  primary:
    "bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-glow hover:shadow-purpleGlow",
  secondary:
    "bg-white/10 text-white border border-white/10 hover:bg-white/15",
  danger:
    "bg-red-500/15 text-red-200 border border-red-500/30 hover:bg-red-500/25",
  ghost:
    "text-slate-300 hover:text-white hover:bg-white/10"
};

export default function Button({
  children,
  className = "",
  variant = "primary",
  loading = false,
  disabled = false,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className
      )}
      {...props}
    >
      {loading && <Loader2 size={18} className="animate-spin" />}
      {children}
    </button>
  );
}
