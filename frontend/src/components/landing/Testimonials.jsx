
import { landingTestimonials } from "../../utils/seedData.js";
import Card from "../common/Card.jsx";

export default function Testimonials() {
  return (
    <section className="py-20" id="testimonials">
      <div className="mx-auto max-w-6xl px-4 text-center md:px-8">
        <p className="text-sm uppercase tracking-[0.3em] text-neon-blue">Student stories</p>
        <h2 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">See how learners are improving</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {landingTestimonials.map((testimonial) => (
            <Card key={testimonial.name} className="space-y-4 p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-2xl text-neon-blue">
                  {testimonial.initials}
                </div>
                <div>
                  <p className="font-semibold text-white">{testimonial.name}</p>
                  <p className="text-sm text-slate-400">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-sm leading-7 text-slate-300">{testimonial.feedback}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

