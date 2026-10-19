
import { Link } from "react-router-dom";
import Button from "../common/Button.jsx";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-slate-950/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 md:px-8">
        <Link to="/" className="text-lg font-semibold text-white">Smart GD</Link>
        <nav className="flex items-center gap-4">
          <a href="#about" className="text-sm text-slate-300 transition hover:text-white">About</a>
          <a href="#features" className="text-sm text-slate-300 transition hover:text-white">Features</a>
          <a href="#testimonials" className="text-sm text-slate-300 transition hover:text-white">Testimonials</a>
          <Link to="/login">
            <Button variant="ghost">Login</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}

