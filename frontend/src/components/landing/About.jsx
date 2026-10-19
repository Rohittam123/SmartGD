
import Card from "../common/Card.jsx";

export default function About() {
  return (
    <section className="py-20" id="about">
      <div className="mx-auto max-w-6xl space-y-8 px-4 text-center md:px-8">
        <p className="text-sm uppercase tracking-[0.3em] text-neon-blue">Why Smart GD</p>
        <h2 className="text-4xl font-semibold text-white sm:text-5xl">Practice smart, speak confidently</h2>
        <p className="mx-auto max-w-2xl text-base leading-8 text-slate-400">
          Smart GD combines guided group sessions, mentor feedback, and leaderboard motivation to help you improve your discussion skills faster.
        </p>
      </div>

      <div className="mt-14 grid gap-6 px-4 md:grid-cols-3 md:px-8">
        {[
          {
            title: "Live rooms",
            description: "Join scheduled group discussions or create a fresh room with classmates and practicers."
          },
          {
            title: "AI mentor",
            description: "Get instant tips, performance insights, and next steps from the built-in mentor assistant."
          },
          {
            title: "Performance tracking",
            description: "Monitor your progress, view leaderboard rankings, and discover where you can improve."
          }
        ].map((item) => (
          <Card key={item.title} className="space-y-4 p-8">
            <h3 className="text-xl font-semibold text-white">{item.title}</h3>
            <p className="text-slate-400">{item.description}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}

