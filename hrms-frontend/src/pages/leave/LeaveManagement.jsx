import { useEffect, useState } from "react";
import { getMyBalanceApi, getMyLeavesApi, applyLeaveApi } from "../../api/leave.api";
import { getHolidaysApi } from "../../api/holiday.api";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";

const tabs = ["My Leaves", "Apply Leave", "Holiday Calendar"];
const statusTone = { pending: "yellow", approved: "green", rejected: "red" };
const leaveTypeOptions = [
  { value: "sick", label: "Sick Leave" },
  { value: "casual", label: "Casual Leave" },
  { value: "earned", label: "Earned Leave" },
];

function BalanceStrip({ balances }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {leaveTypeOptions.map((opt) => {
        const b = balances.find((x) => x.leaveType === opt.value);
        const remaining = b ? b.total - b.used : "—";
        return (
          <div key={opt.value} className="rounded-lg bg-slate-50 py-3 text-center">
            <p className="text-lg font-semibold text-slate-800">{remaining}</p>
            <p className="text-xs text-slate-400">{opt.label}</p>
          </div>
        );
      })}
    </div>
  );
}

function MyLeavesTab({ leaves, balances }) {
  const columns = [
    { key: "fromDate", label: "From", render: (r) => new Date(r.fromDate).toLocaleDateString() },
    { key: "toDate", label: "To", render: (r) => new Date(r.toDate).toLocaleDateString() },
    { key: "leaveType", label: "Type", render: (r) => <span className="capitalize">{r.leaveType}</span> },
    { key: "reason", label: "Reason" },
    { key: "status", label: "Status", render: (r) => <Badge tone={statusTone[r.status]}>{r.status}</Badge> },
    { key: "approvedBy", label: "Approver", render: (r) => r.approvedBy?.name || "—" },
  ];
  return (
    <div className="space-y-6">
      <Card title="Leave Balance">
        <BalanceStrip balances={balances} />
      </Card>
      <Card title="Leave History">
        <Table columns={columns} rows={leaves} />
      </Card>
    </div>
  );
}

function ApplyLeaveTab({ balances, onApplied }) {
  const [form, setForm] = useState({ leaveType: "sick", fromDate: "", toDate: "", reason: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await applyLeaveApi(form);
      setSuccess("Leave request submitted");
      setForm({ leaveType: "sick", fromDate: "", toDate: "", reason: "" });
      onApplied();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit leave request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card title="Leave Balance" className="lg:col-span-1">
        <BalanceStrip balances={balances} />
      </Card>
      <Card title="Apply for Leave" className="lg:col-span-2">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Leave Type"
            options={leaveTypeOptions}
            value={form.leaveType}
            onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="From"
              type="date"
              required
              value={form.fromDate}
              onChange={(e) => setForm({ ...form, fromDate: e.target.value })}
            />
            <Input
              label="To"
              type="date"
              required
              value={form.toDate}
              onChange={(e) => setForm({ ...form, toDate: e.target.value })}
            />
          </div>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-600">Reason</span>
            <textarea
              required
              rows={3}
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500"
            />
          </label>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-emerald-600">{success}</p>}
          <Button type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Application"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

function HolidayCalendarTab() {
  const [holidays, setHolidays] = useState([]);
  useEffect(() => {
    getHolidaysApi({ year: new Date().getFullYear() }).then((data) => setHolidays(data.holidays));
  }, []);

  const columns = [
    { key: "date", label: "Date", render: (r) => new Date(r.date).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }) },
    { key: "name", label: "Occasion" },
    { key: "type", label: "Type", render: (r) => <Badge tone={r.type === "optional" ? "yellow" : "indigo"}>{r.type}</Badge> },
  ];

  return (
    <Card title={`Holidays ${new Date().getFullYear()}`}>
      <Table columns={columns} rows={holidays} />
    </Card>
  );
}

export default function LeaveManagement() {
  const [activeTab, setActiveTab] = useState("My Leaves");
  const [leaves, setLeaves] = useState([]);
  const [balances, setBalances] = useState([]);

  const loadData = () => {
    getMyLeavesApi().then((data) => setLeaves(data.leaves));
    getMyBalanceApi().then((data) => setBalances(data.balances));
  };

  useEffect(loadData, []);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-800">Leave Management</h1>

      <div className="flex gap-1 rounded-lg bg-slate-100 p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
              activeTab === tab ? "bg-white text-accent-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "My Leaves" && <MyLeavesTab leaves={leaves} balances={balances} />}
      {activeTab === "Apply Leave" && <ApplyLeaveTab balances={balances} onApplied={loadData} />}
      {activeTab === "Holiday Calendar" && <HolidayCalendarTab />}
    </div>
  );
}
