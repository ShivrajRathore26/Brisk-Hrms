export default function Input({ label, error, className = "", ...props }) {
  return (
    <label className="block text-sm">
      {label && <span className="mb-1 block font-medium text-slate-600">{label}</span>}
      <input
        className={`w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 ${className}`}
        {...props}
      />
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
  );
}
