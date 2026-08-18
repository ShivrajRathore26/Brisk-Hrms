import { useEffect, useState } from "react";
import { getTeamAttendanceApi } from "../../api/attendance.api";
import { formatTime } from "../../utils/formatters";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";
import Input from "../../components/common/Input";

const statusTone = { present: "green", late: "yellow", half_day: "yellow", absent: "red", leave: "slate" };

export default function TeamAttendance() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getTeamAttendanceApi({ date })
      .then((data) => setTeam(data.team))
      .finally(() => setLoading(false));
  }, [date]);

  const columns = [
    { key: "name", label: "Employee", render: (r) => r.user.name },
    { key: "designation", label: "Designation", render: (r) => r.user.designation || "—" },
    {
      key: "punchIn",
      label: "Punch In",
      render: (r) => (r.attendance?.punchIn ? formatTime(r.attendance.punchIn) : "—"),
    },
    {
      key: "punchOut",
      label: "Punch Out",
      render: (r) => (r.attendance?.punchOut ? formatTime(r.attendance.punchOut) : "—"),
    },
    {
      key: "status",
      label: "Status",
      render: (r) => {
        if (r.attendance) {
          return <Badge tone={statusTone[r.attendance.status] || "slate"}>{r.attendance.status.replace("_", " ")}</Badge>;
        }
        const dayNoteLabels = { holiday: "Holiday", weekend: "Weekend", on_leave: "On Leave", not_joined: "—" };
        if (r.dayNote) return <Badge tone="slate">{dayNoteLabels[r.dayNote]}</Badge>;
        return <Badge tone="red">absent</Badge>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Team Attendance</h1>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-44" />
      </div>

      <Card>
        {loading ? <p className="text-sm text-slate-400">Loading...</p> : <Table columns={columns} rows={team} />}
      </Card>
    </div>
  );
}
