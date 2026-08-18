import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function DateInput({ label, className = "", ...props }) {
  return (
    <label className="block text-sm">
      {label && <span className="mb-1 block font-medium text-slate-600">{label}</span>}
      <DatePicker
        dateFormat="dd MMM yyyy"
        wrapperClassName="w-full"
        className={`w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 disabled:bg-slate-50 disabled:text-slate-400 ${className}`}
        {...props}
      />
    </label>
  );
}
