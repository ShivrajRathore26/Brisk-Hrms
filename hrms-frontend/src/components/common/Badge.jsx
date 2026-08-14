const tones = {
  green: "bg-emerald-50 text-emerald-600",
  red: "bg-red-50 text-red-600",
  yellow: "bg-amber-50 text-amber-600",
  slate: "bg-slate-100 text-slate-600",
  indigo: "bg-accent-50 text-accent-600",
};

export default function Badge({ children, tone = "slate" }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium capitalize ${tones[tone]}`}>
      {children}
    </span>
  );
}
