
import { Link } from "react-router-dom";
import Card from "../../components/common/Card.jsx";
import { GD_CATEGORIES } from "../../utils/constants.js";

export default function Practice() {
  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-glow">
        <h1 className="text-3xl font-semibold text-white">Practice topics</h1>
        <p className="mt-3 text-slate-400">Choose a category to hone your discussion skills.</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {GD_CATEGORIES.map((category) => (
          <Card key={category} className="space-y-4 p-6">
            <h2 className="text-xl font-semibold text-white">{category}</h2>
            <p className="text-sm text-slate-400">Explore prompts and practice techniques for this category.</p>
            <Link to="/mentor" className="text-sm font-semibold text-neon-blue hover:underline">Ask mentor to generate a prompt</Link>
          </Card>
        ))}
      </div>
    </div>
  );
}

