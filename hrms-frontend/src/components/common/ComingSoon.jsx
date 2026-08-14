import Card from "./Card";

export default function ComingSoon({ title }) {
  return (
    <Card>
      <div className="py-16 text-center">
        <h2 className="text-lg font-semibold text-slate-700">{title}</h2>
        <p className="mt-1 text-sm text-slate-400">This screen is being built in the next phase.</p>
      </div>
    </Card>
  );
}
