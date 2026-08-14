const sizes = {
  sm: { box: "h-8 w-8", mark: "text-sm", word: "text-lg" },
  lg: { box: "h-12 w-12", mark: "text-lg", word: "text-2xl" },
};

export default function Logo({ size = "sm", withWordmark = true, className = "" }) {
  const s = sizes[size];
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className={`flex ${s.box} shrink-0 items-center justify-center rounded-lg bg-accent-500 font-bold tracking-tight text-white`}>
        <span className={s.mark}>BC</span>
      </div>
      {withWordmark && (
        <span className={`font-semibold tracking-tight text-slate-900 ${s.word}`}>HRMS</span>
      )}
    </div>
  );
}
