import { useEffect, useState } from "react";
import { Clock, LogIn, LogOut } from "lucide-react";
import { punchInApi, punchOutApi, getTodayStatusApi } from "../../api/attendance.api";
import Card from "../common/Card";
import Button from "../common/Button";
import Badge from "../common/Badge";

const statusTone = { present: "green", late: "yellow", half_day: "yellow", absent: "red", leave: "slate" };

export default function PunchCard() {
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = () => {
    getTodayStatusApi()
      .then((data) => setAttendance(data.attendance))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handlePunchIn = async () => {
    setBusy(true);
    try {
      const data = await punchInApi();
      setAttendance(data.attendance);
    } finally {
      setBusy(false);
    }
  };

  const handlePunchOut = async () => {
    setBusy(true);
    try {
      const data = await punchOutApi();
      setAttendance(data.attendance);
    } finally {
      setBusy(false);
    }
  };

  const fmtTime = (t) => (t ? new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—");

  return (
    <Card title="Today's Attendance">
      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-slate-500">
              <Clock size={16} /> {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
            </div>
            {attendance?.status && <Badge tone={statusTone[attendance.status] || "slate"}>{attendance.status.replace("_", " ")}</Badge>}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-slate-400">Punch In</p>
              <p className="font-semibold text-slate-700">{fmtTime(attendance?.punchIn)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Punch Out</p>
              <p className="font-semibold text-slate-700">{fmtTime(attendance?.punchOut)}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handlePunchIn} disabled={busy || attendance?.punchIn} className="flex-1">
              <LogIn size={16} /> Punch In
            </Button>
            <Button
              onClick={handlePunchOut}
              disabled={busy || !attendance?.punchIn || attendance?.punchOut}
              variant="secondary"
              className="flex-1"
            >
              <LogOut size={16} /> Punch Out
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
