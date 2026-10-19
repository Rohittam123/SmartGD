import { motion } from "framer-motion";
import { cx } from "../../utils/helpers.js";

export default function Card({ children, className = "", animate = true }) {
  const Component = animate ? motion.div : "div";

  return (
    <Component
      initial={animate ? { opacity: 0, y: 18 } : undefined}
      animate={animate ? { opacity: 1, y: 0 } : undefined}
      transition={animate ? { duration: 0.35 } : undefined}
      className={cx("glass rounded-3xl p-6 shadow-glow", className)}
    >
      {children}
    </Component>
  );
}
