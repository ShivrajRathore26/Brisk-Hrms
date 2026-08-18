export default function Card({ title, subtitle, action, children, className = "", padded = true }) {
  return (
    <div className={`rounded-card border border-slate-100 bg-white shadow-card ${padded ? "p-5 sm:p-6" : ""} ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            {title && <h3 className="text-sm font-semibold tracking-tight text-slate-800">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
