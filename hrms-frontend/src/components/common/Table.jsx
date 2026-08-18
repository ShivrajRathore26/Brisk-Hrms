import { Inbox } from "lucide-react";

export default function Table({ columns, rows, emptyMessage = "No records found", onRowClick }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
        <Inbox size={28} className="text-slate-300" />
        <p className="text-sm text-slate-400">{emptyMessage}</p>
      </div>
    );
  }
  return (
    <div className="-mx-5 overflow-x-auto px-5 sm:-mx-6 sm:px-6" style={{ WebkitOverflowScrolling: "touch" }}>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            {columns.map((col) => (
              <th
                key={col.key}
                className="whitespace-nowrap px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400 first:pl-0 last:pr-0"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row._id || i}
              onClick={
                onRowClick
                  ? (e) => {
                      if (e.target.closest("button, a")) return;
                      onRowClick(row);
                    }
                  : undefined
              }
              className={`border-b border-slate-50 transition-colors last:border-0 hover:bg-slate-50/80 ${onRowClick ? "cursor-pointer" : ""}`}
            >
              {columns.map((col) => (
                <td key={col.key} className="whitespace-nowrap px-3 py-3.5 text-slate-600 first:pl-0 last:pr-0">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
