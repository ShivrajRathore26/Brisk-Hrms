const tones = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
  red: "bg-red-50 text-red-700 ring-red-600/10",
  yellow: "bg-amber-50 text-amber-700 ring-amber-600/10",
  slate: "bg-slate-100 text-slate-600 ring-slate-500/10",
  indigo: "bg-accent-50 text-accent-700 ring-accent-600/10",
};

const dots = {
  green: "bg-emerald-500",
  red: "bg-red-500",
  yellow: "bg-amber-500",
  slate: "bg-slate-400",
  indigo: "bg-accent-500",
};

export default function Badge({ children, tone = "slate", dot = false }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${tones[tone]}`}
    >
      {dot && <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dots[tone]}`} />}
      {children}
    </span>
  );
}
