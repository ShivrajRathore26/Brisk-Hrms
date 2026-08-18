export default function Input({ label, error, icon: Icon, className = "", ...props }) {
  return (
    <label className="block text-sm">
      {label && <span className="mb-1.5 block font-medium text-slate-600">{label}</span>}
      <div className="relative">
        {Icon && <Icon size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />}
        <input
          className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-800 outline-none transition-colors duration-150 placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${
            Icon ? "pl-9" : ""
          } ${
            error
              ? "border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-400"
              : "border-slate-200 focus:border-accent-500 focus:ring-1 focus:ring-accent-500"
          } ${className}`}
          {...props}
        />
      </div>
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
  );
}
