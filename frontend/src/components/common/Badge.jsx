import { cx } from "../../utils/helpers.js";

export default function Badge({ children, color = "blue", className = "" }) {
  const colors = {
    blue: "bg-sky-400/10 text-sky-200 border-sky-400/20",
    purple: "bg-purple-400/10 text-purple-200 border-purple-400/20",
    green: "bg-emerald-400/10 text-emerald-200 border-emerald-400/20",
    red: "bg-red-400/10 text-red-200 border-red-400/20",
    yellow: "bg-yellow-400/10 text-yellow-200 border-yellow-400/20"
  };

  return (
    <span
      className={cx(
        "inline-flex rounded-full border px-3 py-1 text-xs font-semibold",
        colors[color],
        className
      )}
    >
      {children}
    </span>
  );
}
