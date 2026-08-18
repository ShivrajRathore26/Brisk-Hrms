import { useEffect, useState } from "react";
import { XCircle } from "lucide-react";
import { getMyBalanceApi, getMyLeavesApi, applyLeaveApi, cancelLeaveApi } from "../../api/leave.api";
import { getHolidaysApi } from "../../api/holiday.api";
import { dateKey, buildHolidaySet, makeLeaveDateFilter } from "../../utils/leaveDates";
import { formatDate } from "../../utils/formatters";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";
import DateInput from "../../components/common/DateInput";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Select from "../../components/common/Select";
import StatTile from "../../components/common/StatTile";
import IconButton from "../../components/common/IconButton";

const tabs = ["My Leaves", "Apply Leave", "Holiday Calendar"];
const statusTone = { pending: "yellow", approved: "green", rejected: "red" };
const leaveStatusOptions = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

function BalanceStrip({ balance }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <StatTile value={balance ? balance.available : "—"} label="Available" />
      <StatTile value={balance ? balance.accrued : "—"} label="Accrued" />
      <StatTile value={balance ? balance.used : "—"} label="Used" />
    </div>
  );
}

function MyLeavesTab({ leaves, balance, onCancelled }) {
  const [statusFilter, setStatusFilter] = useState("");
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const filtered = statusFilter ? leaves.filter((l) => l.status === statusFilter) : leaves;

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelLeaveApi(cancelTarget._id);
      setCancelTarget(null);
      onCancelled();
    } finally {
      setCancelling(false);
    }
  };

  const columns = [
    { key: "fromDate", label: "From", render: (r) => formatDate(r.fromDate) },
    { key: "toDate", label: "To", render: (r) => formatDate(r.toDate) },
    {
      key: "days",
      label: "Days",
      render: (r) => Math.floor((new Date(r.toDate) - new Date(r.fromDate)) / (1000 * 60 * 60 * 24)) + 1,
    },
    { key: "reason", label: "Reason" },
    { key: "status", label: "Status", render: (r) => <Badge tone={statusTone[r.status]}>{r.status}</Badge> },
    {
      key: "unpaidDays",
      label: "Unpaid",
      render: (r) => (r.unpaidDays > 0 ? <Badge tone="red">{r.unpaidDays} unpaid</Badge> : "—"),
    },
    { key: "approvedBy", label: "Approver", render: (r) => r.approvedBy?.name || "—" },
    {
      key: "actions",
      label: "",
      render: (r) =>
        r.status === "pending" ? (
          <IconButton icon={XCircle} label="Cancel request" tone="red" onClick={() => setCancelTarget(r)} />
        ) : null,
    },
  ];
  return (
    <div className="space-y-6">
      <Card title="Leave Balance">
        <BalanceStrip balance={balance} />
      </Card>
      <Card
        title="Leave History"
        action={
          <Select
            placeholder="All statuses"
            options={leaveStatusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-40 !py-1.5"
          />
        }
      >
        <Table columns={columns} rows={filtered} emptyMessage="No leave requests" />
      </Card>

      <Modal
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Cancel Leave Request"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCancelTarget(null)}>Keep It</Button>
            <Button variant="danger" onClick={handleCancel} disabled={cancelling}>
              {cancelling ? "Cancelling..." : "Cancel Request"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Withdraw your leave request for{" "}
          <span className="font-medium text-slate-800">
            {cancelTarget && `${formatDate(cancelTarget.fromDate)} - ${formatDate(cancelTarget.toDate)}`}
          </span>
          ?
        </p>
      </Modal>
    </div>
  );
}

function ApplyLeaveTab({ balance, onApplied }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [holidaySet, setHolidaySet] = useState(new Set());
  const [form, setForm] = useState({ fromDate: null, toDate: null, reason: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getHolidaysApi().then((data) => setHolidaySet(buildHolidaySet(data.holidays)));
  }, []);

  const dateFilter = makeLeaveDateFilter(holidaySet);

  const requestedDays =
    form.fromDate && form.toDate
      ? Math.max(1, Math.floor((form.toDate - form.fromDate) / (1000 * 60 * 60 * 24)) + 1)
      : 0;
  const unpaidPreview = balance && requestedDays > 0 ? Math.max(0, requestedDays - balance.available) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      const data = await applyLeaveApi({
        fromDate: dateKey(form.fromDate),
        toDate: dateKey(form.toDate),
        reason: form.reason,
      });
      setSuccess(
        data.unpaidDays > 0
          ? `Leave request submitted — ${data.unpaidDays} day${data.unpaidDays > 1 ? "s" : ""} of it will be unpaid`
          : "Leave request submitted"
      );
      setForm({ fromDate: null, toDate: null, reason: "" });
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
        <BalanceStrip balance={balance} />
        <p className="mt-3 text-xs text-slate-400">
          You accrue 1 leave every month. Unused leave carries forward. Leave beyond your available balance is
          still allowed — it's just unpaid. Weekends and holidays can't be selected.
        </p>
      </Card>
      <Card title="Apply for Leave" className="lg:col-span-2">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DateInput
              label="From"
              required
              minDate={today}
              filterDate={dateFilter}
              placeholderText="Select a date"
              selected={form.fromDate}
              onChange={(date) => setForm({ ...form, fromDate: date, toDate: null })}
            />
            <DateInput
              label="To"
              required
              minDate={form.fromDate || today}
              filterDate={dateFilter}
              disabled={!form.fromDate}
              placeholderText="Select a date"
              selected={form.toDate}
              onChange={(date) => setForm({ ...form, toDate: date })}
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
          {unpaidPreview > 0 && (
            <p className="text-sm text-amber-600">
              {requestedDays} day{requestedDays > 1 ? "s" : ""} requested — {unpaidPreview} of it will be unpaid
              (beyond your {balance.available} available).
            </p>
          )}
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
    { key: "date", label: "Date", render: (r) => formatDate(r.date, { weekday: "long", month: "long", day: "numeric" }) },
    { key: "name", label: "Occasion" },
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
  const [balance, setBalance] = useState(null);

  const loadData = () => {
    getMyLeavesApi().then((data) => setLeaves(data.leaves));
    getMyBalanceApi().then((data) => setBalance(data.balance));
  };

  useEffect(loadData, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Leave Management</h1>

      <div className="flex w-full gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1 sm:w-fit">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 whitespace-nowrap rounded-md px-4 py-1.5 text-sm font-medium transition ${
              activeTab === tab ? "bg-white text-accent-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "My Leaves" && <MyLeavesTab leaves={leaves} balance={balance} onCancelled={loadData} />}
      {activeTab === "Apply Leave" && <ApplyLeaveTab balance={balance} onApplied={loadData} />}
      {activeTab === "Holiday Calendar" && <HolidayCalendarTab />}
    </div>
  );
}
