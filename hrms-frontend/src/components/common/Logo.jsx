const sizes = {
  sm: { mark: "h-8 w-8", word: "text-lg" },
  lg: { mark: "h-12 w-12", word: "text-2xl" },
};

export default function Logo({ size = "sm", withWordmark = true, className = "" }) {
  const s = sizes[size];
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img src="/BClogo.png" alt="BriskCovey" className={`${s.mark} shrink-0 object-contain`} />
      {withWordmark && (
        <span className={`font-semibold tracking-tight text-slate-900 ${s.word}`}>HRMS</span>
      )}
    </div>
  );
}
