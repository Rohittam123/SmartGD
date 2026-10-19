
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../common/Button.jsx";

export default function Hero() {
  return (
    <section className="min-h-[75vh] py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 md:flex-row md:items-center md:justify-between md:px-8">
        <div className="max-w-2xl space-y-6">
          <p className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm uppercase tracking-[0.3em] text-neon-blue">
            Smart group discussion practice
          </p>
          <h1 className="text-5xl font-semibold leading-tight text-white sm:text-6xl">
            Build confidence, improve reasoning, and lead every discussion.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-400">
            Practice group discussion sessions with real-time rooms, live feedback, mentor guidance, and progress tracking.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link to="/register">
              <Button className="min-w-[180px]">Get started</Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" className="min-w-[180px]">Sign in</Button>
            </Link>
          </div>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-glow">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Trusted by top performers</p>
            <div className="grid gap-4">
              {[
                "Fast room creation",
                "Smart mentor feedback",
                "Leaderboard motivation"
              ].map((item) => (
                <div key={item} className="rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-sm text-slate-300">
                  {item}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <ArrowRight size={18} />
              <span>Available for students, educators, and interview preparation groups.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

