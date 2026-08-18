export default function Select({ label, error, options = [], placeholder, className = "", ...props }) {
  return (
    <label className="block text-sm">
      {label && <span className="mb-1.5 block font-medium text-slate-600">{label}</span>}
      <div className={`relative ${className}`}>
        <select
          className={`w-full appearance-none rounded-lg border bg-white px-3 py-2 pr-9 text-sm text-slate-800 outline-none transition-colors duration-150 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${
            error
              ? "border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-400"
              : "border-slate-200 focus:border-accent-500 focus:ring-1 focus:ring-accent-500"
          } ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
  );
}
