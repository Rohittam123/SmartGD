import Card from "../common/Card.jsx";

const featuresList = [
  {
    title: "Instant room setup",
    description: "Create or join group discussion rooms in seconds with live audio, chat, and real-time feedback."
  },
  {
    title: "AI mentor guidance",
    description: "Receive smart suggestions, strengths analysis, and improvement tips while you speak."
  },
  {
    title: "Performance dashboard",
    description: "Track your progress across sessions with analytics, leaderboards, and goal-based recommendations."
  }
];

export default function Features() {
  return (
    <section className="py-20 bg-slate-950/40" id="features">
      <div className="mx-auto max-w-6xl px-4 text-center md:px-8">
        <p className="text-sm uppercase tracking-[0.3em] text-neon-blue">Features</p>
        <h2 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">Everything you need to lead better discussions</h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-400">
          Smart GD helps you practice with confidence, get guidance from AI and mentors, and build skills through feedback and analytics.
        </p>
      </div>

      <div className="mt-14 grid gap-6 px-4 md:grid-cols-3 md:px-8">
        {featuresList.map((feature) => (
          <Card key={feature.title} className="space-y-4 p-8">
            <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
            <p className="text-slate-400">{feature.description}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
