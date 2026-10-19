import { cx } from "../../utils/helpers.js";

export default function Input({
  label,
  error,
  className = "",
  textarea = false,
  ...props
}) {
  const Component = textarea ? "textarea" : "input";

  return (
    <label className="block">
      {label && <span className="mb-2 block text-sm font-medium text-slate-300">{label}</span>}

      <Component
        className={cx(
          "w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-neon-blue focus:ring-4 focus:ring-neon-blue/10",
          textarea && "min-h-32 resize-none",
          error && "border-red-400 focus:border-red-400 focus:ring-red-400/10",
          className
        )}
        {...props}
      />

      {error && <span className="mt-2 block text-sm text-red-300">{error}</span>}
    </label>
  );
}
