
export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/80 py-10 text-slate-400">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 text-center md:flex-row md:items-center md:justify-between md:px-8">
        <p>© {new Date().getFullYear()} Smart GD. All rights reserved.</p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500">
          <a href="#" className="hover:text-white">Privacy</a>
          <a href="#" className="hover:text-white">Terms</a>
          <a href="#" className="hover:text-white">Support</a>
        </div>
      </div>
    </footer>
  );
}

