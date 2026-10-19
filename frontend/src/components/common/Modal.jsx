
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import Button from "./Button.jsx";

export default function Modal({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKey = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKey);

    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
      <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-950/95 p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            {title && <h2 className="text-xl font-semibold text-white">{title}</h2>}
            <p className="mt-2 text-sm text-slate-400">Use the controls below to keep working.</p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>
        <div className="space-y-4">{children}</div>
        {footer && <div className="mt-6 flex justify-end">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

