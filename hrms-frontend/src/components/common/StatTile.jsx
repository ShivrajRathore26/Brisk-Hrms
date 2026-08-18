export default function StatTile({ value, label }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-3.5 text-center">
      <p className="text-xl font-semibold tracking-tight text-slate-800">{value}</p>
      <p className="mt-0.5 truncate text-xs font-medium capitalize text-slate-400">{label}</p>
    </div>
  );
}
