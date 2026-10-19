/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"]
      },
      colors: {
        dark: {
          950: "#050509",
          900: "#090914",
          800: "#111122",
          700: "#191930"
        },
        neon: {
          blue: "#38bdf8",
          cyan: "#22d3ee",
          purple: "#a855f7",
          pink: "#ec4899"
        }
      },
      boxShadow: {
        glow: "0 0 35px rgba(56, 189, 248, 0.25)",
        purpleGlow: "0 0 35px rgba(168, 85, 247, 0.25)"
      },
      backgroundImage: {
        radialGlow:
          "radial-gradient(circle at top left, rgba(56,189,248,.25), transparent 28%), radial-gradient(circle at top right, rgba(168,85,247,.24), transparent 30%)"
      }
    }
  },
  plugins: []
};
