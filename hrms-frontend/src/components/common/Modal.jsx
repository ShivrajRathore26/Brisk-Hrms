import { createPortal } from "react-dom";
import { X } from "lucide-react";

const sizes = {
  md: "max-w-lg",
  lg: "max-w-3xl",
};

export default function Modal({ open, onClose, title, children, footer, size = "md" }) {
  if (!open) return null;
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`flex max-h-[85vh] w-full ${sizes[size]} flex-col rounded-card border border-slate-100 bg-white shadow-popover animate-scale-in`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-base font-semibold tracking-tight text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            title="Close"
            aria-label="Close"
            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex shrink-0 justify-end gap-2 border-t border-slate-100 px-6 py-4">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
