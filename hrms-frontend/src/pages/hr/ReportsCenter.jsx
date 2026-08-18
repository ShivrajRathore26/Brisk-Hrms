import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getAttendanceReportApi, getLeaveReportApi, getAssetReportApi } from "../../api/report.api";
import { formatDate } from "../../utils/formatters";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";

const statusTone = {
  present: "green", late: "yellow", half_day: "yellow", absent: "red", leave: "slate",
  pending: "yellow", approved: "green", rejected: "red",
};

function firstOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function DateRangeFilter({ from, to, onFromChange, onToChange }) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <Input label="From" type="date" value={from} onChange={(e) => onFromChange(e.target.value)} className="w-40" />
      <Input label="To" type="date" value={to} onChange={(e) => onToChange(e.target.value)} className="w-40" />
    </div>
  );
}

function AttendanceTab() {
  const [from, setFrom] = useState(firstOfMonth());
  const [to, setTo] = useState(today());
  const [data, setData] = useState({ summary: {}, records: [] });

  useEffect(() => {
    getAttendanceReportApi({ from, to }).then(setData);
  }, [from, to]);

  const columns = [
    { key: "user", label: "Employee", render: (r) => r.user?.name },
    { key: "date", label: "Date", render: (r) => formatDate(r.date) },
    { key: "status", label: "Status", render: (r) => <Badge tone={statusTone[r.status]}>{r.status.replace("_", " ")}</Badge> },
  ];

  return (
    <div className="space-y-4">
      <DateRangeFilter from={from} to={to} onFromChange={setFrom} onToChange={setTo} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {Object.entries(data.summary).map(([status, count]) => (
          <Card key={status}>
            <p className="text-xl font-semibold tracking-tight text-slate-900">{count}</p>
            <p className="mt-0.5 text-xs font-medium capitalize text-slate-400">{status.replace("_", " ")}</p>
          </Card>
        ))}
      </div>
      <Card title="Attendance Records">
        <Table columns={columns} rows={data.records} emptyMessage="No attendance records in this range" />
      </Card>
    </div>
  );
}

const leaveStatusOptions = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

function LeaveTab() {
  const [from, setFrom] = useState(firstOfMonth());
  const [to, setTo] = useState(today());
  const [status, setStatus] = useState("");
  const [data, setData] = useState({ summary: {}, records: [] });

  useEffect(() => {
    getLeaveReportApi({ from, to, status: status || undefined }).then(setData);
  }, [from, to, status]);

  const columns = [
    { key: "user", label: "Employee", render: (r) => r.user?.name },
    { key: "dates", label: "Dates", render: (r) => `${formatDate(r.fromDate)} - ${formatDate(r.toDate)}` },
    { key: "status", label: "Status", render: (r) => <Badge tone={statusTone[r.status]}>{r.status}</Badge> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <DateRangeFilter from={from} to={to} onFromChange={setFrom} onToChange={setTo} />
        <Select
          label="Status"
          placeholder="All statuses"
          options={leaveStatusOptions}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-40"
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {Object.entries(data.summary).map(([s, count]) => (
          <Card key={s}>
            <p className="text-xl font-semibold tracking-tight text-slate-900">{count}</p>
            <p className="mt-0.5 text-xs font-medium capitalize text-slate-400">{s}</p>
          </Card>
        ))}
      </div>
      <Card title="Leave Records">
        <Table columns={columns} rows={data.records} emptyMessage="No leave requests in this range" />
      </Card>
    </div>
  );
}

function AssetTab() {
  const [data, setData] = useState({ byStatus: {}, byType: {}, total: 0 });
  useEffect(() => {
    getAssetReportApi().then(setData);
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card title="Assets by Status">
        <ul className="divide-y divide-slate-50">
          {Object.entries(data.byStatus).map(([status, count]) => (
            <li key={status} className="flex items-center justify-between py-2.5 text-sm first:pt-0 last:pb-0">
              <Badge tone={statusTone[status] || "slate"}>{status.replace("_", " ")}</Badge>
              <span className="font-semibold text-slate-700">{count}</span>
            </li>
          ))}
        </ul>
      </Card>
      <Card title="Assets by Type">
        <ul className="divide-y divide-slate-50">
          {Object.entries(data.byType).map(([type, count]) => (
            <li key={type} className="flex items-center justify-between py-2.5 text-sm first:pt-0 last:pb-0">
              <span className="capitalize text-slate-600">{type}</span>
              <span className="font-semibold text-slate-700">{count}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

export default function ReportsCenter() {
  const { user } = useAuth();
  const canSeeAssets = ["hr", "super_admin"].includes(user?.role);
  const tabs = ["Attendance", "Leave", ...(canSeeAssets ? ["Assets"] : [])];
  const [activeTab, setActiveTab] = useState("Attendance");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Reports Center</h1>
        <p className="mt-1 text-sm text-slate-500">Attendance, leave, and asset activity across your team.</p>
      </div>

      <div className="flex w-full gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1 sm:w-fit">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 whitespace-nowrap rounded-md px-4 py-1.5 text-sm font-medium transition-colors duration-150 ${
              activeTab === tab ? "bg-white text-accent-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Attendance" && <AttendanceTab />}
      {activeTab === "Leave" && <LeaveTab />}
      {activeTab === "Assets" && canSeeAssets && <AssetTab />}
    </div>
  );
}
