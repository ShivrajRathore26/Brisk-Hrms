import { useEffect, useState } from "react";
import { getMyHistoryApi } from "../../api/attendance.api";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";
import Select from "../../components/common/Select";

const statusTone = { present: "green", late: "yellow", half_day: "yellow", absent: "red", leave: "slate" };
const months = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: new Date(2000, i, 1).toLocaleString(undefined, { month: "long" }),
}));

export default function AttendanceHistory() {
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getMyHistoryApi({ month, year })
      .then((data) => setRecords(data.records))
      .finally(() => setLoading(false));
  }, [month, year]);

  const columns = [
    { key: "date", label: "Date", render: (r) => new Date(r.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }) },
    { key: "punchIn", label: "Punch In", render: (r) => (r.punchIn ? new Date(r.punchIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—") },
    { key: "punchOut", label: "Punch Out", render: (r) => (r.punchOut ? new Date(r.punchOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—") },
    { key: "status", label: "Status", render: (r) => <Badge tone={statusTone[r.status] || "slate"}>{r.status.replace("_", " ")}</Badge> },
  ];

  const summary = records.reduce(
    (acc, r) => ({ ...acc, [r.status]: (acc[r.status] || 0) + 1 }),
    {}
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-slate-800">Attendance History</h1>
        <div className="flex gap-2">
          <Select value={month} onChange={(e) => setMonth(e.target.value)} options={months} />
          <Select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            options={[0, 1, 2].map((i) => {
              const y = now.getFullYear() - i;
              return { value: String(y), label: String(y) };
            })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {["present", "late", "half_day", "absent"].map((s) => (
          <Card key={s} className="text-center">
            <p className="text-2xl font-semibold text-slate-800">{summary[s] || 0}</p>
            <p className="text-xs capitalize text-slate-400">{s.replace("_", " ")}</p>
          </Card>
        ))}
      </div>

      <Card title="Records">
        {loading ? <p className="text-sm text-slate-400">Loading...</p> : <Table columns={columns} rows={records} />}
      </Card>
    </div>
  );
}
