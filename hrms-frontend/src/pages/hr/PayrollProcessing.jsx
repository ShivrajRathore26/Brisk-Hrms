import { useEffect, useState } from "react";
import { PlayCircle } from "lucide-react";
import { getUsersApi } from "../../api/user.api";
import {
  runPayrollApi,
  getAllPayslipsApi,
  getSalaryStructureApi,
  upsertSalaryStructureApi,
} from "../../api/payroll.api";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import Select from "../../components/common/Select";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

const monthOptions = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: new Date(2000, i, 1).toLocaleString(undefined, { month: "long" }),
}));

function SalaryStructureForm({ users }) {
  const [userId, setUserId] = useState("");
  const [structure, setStructure] = useState({ basic: "", hra: "", allowances: "", deductions: "" });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) return;
    getSalaryStructureApi(userId).then((data) => {
      if (data.structure) {
        const { basic, hra, allowances, deductions } = data.structure;
        setStructure({ basic, hra, allowances, deductions });
      } else {
        setStructure({ basic: "", hra: "", allowances: "", deductions: "" });
      }
    });
  }, [userId]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await upsertSalaryStructureApi(userId, structure);
      setMessage("Salary structure saved");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card title="Salary Structure Setup">
      <form onSubmit={handleSave} className="space-y-4">
        <Select
          label="Employee"
          placeholder="Select employee"
          options={users.map((u) => ({ value: u._id, label: u.name }))}
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        {userId && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Basic"
                type="number"
                required
                value={structure.basic}
                onChange={(e) => setStructure({ ...structure, basic: e.target.value })}
              />
              <Input
                label="HRA"
                type="number"
                value={structure.hra}
                onChange={(e) => setStructure({ ...structure, hra: e.target.value })}
              />
              <Input
                label="Allowances"
                type="number"
                value={structure.allowances}
                onChange={(e) => setStructure({ ...structure, allowances: e.target.value })}
              />
              <Input
                label="Deductions"
                type="number"
                value={structure.deductions}
                onChange={(e) => setStructure({ ...structure, deductions: e.target.value })}
              />
            </div>
            {message && <p className="text-sm text-emerald-600">{message}</p>}
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Structure"}
            </Button>
          </>
        )}
      </form>
    </Card>
  );
}

export default function PayrollProcessing() {
  const now = new Date();
  const [users, setUsers] = useState([]);
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [payslips, setPayslips] = useState([]);

  const loadPayslips = () => {
    getAllPayslipsApi({ month, year }).then((data) => setPayslips(data.payslips));
  };

  useEffect(() => {
    getUsersApi().then((data) => setUsers(data.users));
  }, []);

  useEffect(loadPayslips, [month, year]);

  const handleRun = async () => {
    setRunning(true);
    setResults(null);
    try {
      const data = await runPayrollApi({ month: Number(month), year: Number(year) });
      setResults(data.results);
      loadPayslips();
    } finally {
      setRunning(false);
    }
  };

  const columns = [
    { key: "user", label: "Employee", render: (r) => r.user?.name },
    { key: "grossPay", label: "Gross Pay", render: (r) => `Rs. ${r.grossPay.toLocaleString("en-IN")}` },
    { key: "taxDeducted", label: "Tax", render: (r) => `Rs. ${r.taxDeducted.toLocaleString("en-IN")}` },
    { key: "netPay", label: "Net Pay", render: (r) => `Rs. ${r.netPay.toLocaleString("en-IN")}` },
    {
      key: "pdf",
      label: "",
      render: (r) =>
        r.pdfUrl && (
          <a href={r.pdfUrl} target="_blank" rel="noreferrer" className="text-xs font-medium text-accent-600 hover:underline">
            View PDF
          </a>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-800">Payroll Processing</h1>

      <Card title="Run Monthly Payroll">
        <div className="flex flex-wrap items-end gap-3">
          <Select label="Month" options={monthOptions} value={month} onChange={(e) => setMonth(e.target.value)} />
          <Select
            label="Year"
            options={[0, 1].map((i) => {
              const y = now.getFullYear() - i;
              return { value: String(y), label: String(y) };
            })}
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
          <Button onClick={handleRun} disabled={running}>
            <PlayCircle size={16} /> {running ? "Running..." : "Run Payroll"}
          </Button>
        </div>
        {results && (
          <ul className="mt-4 space-y-1 text-sm text-slate-500">
            {results.map((r, i) => (
              <li key={i}>
                {r.user}: <span className="font-medium text-slate-700">{r.status}</span>
                {r.reason ? ` (${r.reason})` : ""}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <SalaryStructureForm users={users} />

      <Card title="Generated Payslips">
        <Table columns={columns} rows={payslips} emptyMessage="No payslips generated for this period" />
      </Card>
    </div>
  );
}
