const tones = {
  slate: "text-slate-400 hover:bg-slate-100 hover:text-slate-600",
  accent: "text-slate-400 hover:bg-accent-50 hover:text-accent-600",
  red: "text-slate-400 hover:bg-red-50 hover:text-red-600",
  green: "text-slate-400 hover:bg-emerald-50 hover:text-emerald-600",
};

export default function IconButton({ icon: Icon, label, tone = "slate", size = 16, className = "", ...props }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${tones[tone]} ${className}`}
      {...props}
    >
      <Icon size={size} />
    </button>
  );
}
