export default function Card({ title, action, children, className = "" }) {
  return (
    <div className={`rounded-card bg-white p-5 shadow-sm ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between">
          {title && <h3 className="text-sm font-semibold text-slate-700">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
