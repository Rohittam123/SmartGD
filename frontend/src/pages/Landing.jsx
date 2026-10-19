
import About from "../components/landing/About.jsx";
import Features from "../components/landing/Features.jsx";
import Footer from "../components/landing/Footer.jsx";
import Hero from "../components/landing/Hero.jsx";
import Navbar from "../components/landing/Navbar.jsx";
import Testimonials from "../components/landing/Testimonials.jsx";

export default function Landing() {
  return (
    <div className="overflow-hidden">
      <Navbar />
      <main className="relative">
        <Hero />
        <Features />
        <About />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}

