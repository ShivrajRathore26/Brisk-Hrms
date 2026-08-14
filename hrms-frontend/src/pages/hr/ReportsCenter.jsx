import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getAttendanceReportApi,
  getLeaveReportApi,
  getPayrollReportApi,
  getAssetReportApi,
} from "../../api/report.api";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";
import Select from "../../components/common/Select";

const statusTone = {
  present: "green", late: "yellow", half_day: "yellow", absent: "red", leave: "slate",
  pending: "yellow", approved: "green", rejected: "red",
};

function AttendanceTab() {
  const [data, setData] = useState({ summary: {}, records: [] });
  useEffect(() => {
    getAttendanceReportApi().then(setData);
  }, []);

  const columns = [
    { key: "user", label: "Employee", render: (r) => r.user?.name },
    { key: "date", label: "Date", render: (r) => new Date(r.date).toLocaleDateString() },
    { key: "status", label: "Status", render: (r) => <Badge tone={statusTone[r.status]}>{r.status.replace("_", " ")}</Badge> },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {Object.entries(data.summary).map(([status, count]) => (
          <Card key={status} className="text-center">
            <p className="text-xl font-semibold text-slate-800">{count}</p>
            <p className="text-xs capitalize text-slate-400">{status.replace("_", " ")}</p>
          </Card>
        ))}
      </div>
      <Card title="Attendance Records">
        <Table columns={columns} rows={data.records} />
      </Card>
    </div>
  );
}

function LeaveTab() {
  const [data, setData] = useState({ summary: {}, records: [] });
  useEffect(() => {
    getLeaveReportApi().then(setData);
  }, []);

  const columns = [
    { key: "user", label: "Employee", render: (r) => r.user?.name },
    { key: "leaveType", label: "Type", render: (r) => <span className="capitalize">{r.leaveType}</span> },
    { key: "dates", label: "Dates", render: (r) => `${new Date(r.fromDate).toLocaleDateString()} - ${new Date(r.toDate).toLocaleDateString()}` },
    { key: "status", label: "Status", render: (r) => <Badge tone={statusTone[r.status]}>{r.status}</Badge> },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {Object.entries(data.summary).map(([status, count]) => (
          <Card key={status} className="text-center">
            <p className="text-xl font-semibold text-slate-800">{count}</p>
            <p className="text-xs capitalize text-slate-400">{status}</p>
          </Card>
        ))}
      </div>
      <Card title="Leave Records">
        <Table columns={columns} rows={data.records} />
      </Card>
    </div>
  );
}

function PayrollTab() {
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [data, setData] = useState({ totals: {}, payslips: [] });

  useEffect(() => {
    getPayrollReportApi({ month, year }).then(setData);
  }, [month, year]);

  const columns = [
    { key: "user", label: "Employee", render: (r) => r.user?.name },
    { key: "grossPay", label: "Gross Pay", render: (r) => `Rs. ${r.grossPay.toLocaleString("en-IN")}` },
    { key: "taxDeducted", label: "Tax", render: (r) => `Rs. ${r.taxDeducted.toLocaleString("en-IN")}` },
    { key: "netPay", label: "Net Pay", render: (r) => `Rs. ${r.netPay.toLocaleString("en-IN")}` },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          options={Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: new Date(2000, i, 1).toLocaleString(undefined, { month: "long" }) }))}
        />
        <Select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          options={[0, 1].map((i) => ({ value: String(now.getFullYear() - i), label: String(now.getFullYear() - i) }))}
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {["grossPay", "taxDeducted", "netPay"].map((key) => (
          <Card key={key} className="text-center">
            <p className="text-xl font-semibold text-slate-800">Rs. {(data.totals[key] || 0).toLocaleString("en-IN")}</p>
            <p className="text-xs capitalize text-slate-400">{key.replace(/([A-Z])/g, " $1")}</p>
          </Card>
        ))}
      </div>
      <Card title="Payroll Summary">
        <Table columns={columns} rows={data.payslips} />
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
        <ul className="space-y-2 text-sm">
          {Object.entries(data.byStatus).map(([status, count]) => (
            <li key={status} className="flex items-center justify-between">
              <Badge tone={statusTone[status] || "slate"}>{status.replace("_", " ")}</Badge>
              <span className="font-medium text-slate-700">{count}</span>
            </li>
          ))}
        </ul>
      </Card>
      <Card title="Assets by Type">
        <ul className="space-y-2 text-sm">
          {Object.entries(data.byType).map(([type, count]) => (
            <li key={type} className="flex items-center justify-between">
              <span className="capitalize text-slate-600">{type}</span>
              <span className="font-medium text-slate-700">{count}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

export default function ReportsCenter() {
  const { user } = useAuth();
  const canSeeFinance = ["hr", "super_admin"].includes(user?.role);
  const tabs = ["Attendance", "Leave", ...(canSeeFinance ? ["Payroll", "Assets"] : [])];
  const [activeTab, setActiveTab] = useState("Attendance");

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-800">Reports Center</h1>

      <div className="flex w-fit gap-1 rounded-lg bg-slate-100 p-1">
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

      {activeTab === "Attendance" && <AttendanceTab />}
      {activeTab === "Leave" && <LeaveTab />}
      {activeTab === "Payroll" && canSeeFinance && <PayrollTab />}
      {activeTab === "Assets" && canSeeFinance && <AssetTab />}
    </div>
  );
}
