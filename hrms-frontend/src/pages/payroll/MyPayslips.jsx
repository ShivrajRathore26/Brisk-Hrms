import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { getMyPayslipsApi } from "../../api/payroll.api";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function MyPayslips() {
  const [payslips, setPayslips] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyPayslipsApi()
      .then((data) => {
        setPayslips(data.payslips);
        setSelected(data.payslips[0] || null);
      })
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: "period", label: "Period", render: (r) => `${monthNames[r.month - 1]} ${r.year}` },
    { key: "grossPay", label: "Gross Pay", render: (r) => `Rs. ${r.grossPay.toLocaleString("en-IN")}` },
    { key: "taxDeducted", label: "Tax", render: (r) => `Rs. ${r.taxDeducted.toLocaleString("en-IN")}` },
    { key: "netPay", label: "Net Pay", render: (r) => `Rs. ${r.netPay.toLocaleString("en-IN")}` },
    {
      key: "pdf",
      label: "",
      render: (r) =>
        r.pdfUrl && (
          <a
            href={r.pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-xs font-medium text-accent-600 hover:underline"
          >
            <Download size={14} /> Download
          </a>
        ),
    },
  ];

  if (loading) return <p className="text-sm text-slate-400">Loading...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-800">My Payslips</h1>

      {selected && (
        <Card title={`Salary Breakdown — ${monthNames[selected.month - 1]} ${selected.year}`}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ["Basic", selected.basic],
              ["HRA", selected.hra],
              ["Deductions", selected.deductions],
              ["Net Pay", selected.netPay],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-slate-50 py-3 text-center">
                <p className="text-lg font-semibold text-slate-800">Rs. {value.toLocaleString("en-IN")}</p>
                <p className="text-xs text-slate-400">{label}</p>
              </div>
            ))}
          </div>
          {selected.pdfUrl && (
            <a
              href={selected.pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white hover:bg-accent-700"
            >
              <Download size={16} /> Download PDF Payslip
            </a>
          )}
        </Card>
      )}

      <Card title="Past Payslips">
        <Table
          columns={columns}
          rows={payslips.map((p) => ({ ...p, onClick: () => setSelected(p) }))}
          emptyMessage="No payslips generated yet"
        />
      </Card>
    </div>
  );
}
