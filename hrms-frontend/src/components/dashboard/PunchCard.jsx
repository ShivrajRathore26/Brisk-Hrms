import { useEffect, useState } from "react";
import { Clock, LogIn, LogOut, MapPin } from "lucide-react";
import { punchInApi, punchOutApi, getTodayStatusApi } from "../../api/attendance.api";
import { getCurrentLocation } from "../../utils/geolocation";
import { formatDate, formatTime } from "../../utils/formatters";
import Card from "../common/Card";
import Button from "../common/Button";
import Badge from "../common/Badge";
import Modal from "../common/Modal";

const statusTone = { present: "green", late: "yellow", half_day: "yellow", absent: "red", leave: "slate" };

export default function PunchCard() {
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // "in" | "out" | null
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    getTodayStatusApi()
      .then((data) => setAttendance(data.attendance))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openConfirm = (action) => {
    setError("");
    setConfirmAction(action);
  };

  const handleConfirm = async () => {
    setBusy(true);
    setError("");
    try {
      setLocating(true);
      const location = await getCurrentLocation();
      setLocating(false);

      const data = confirmAction === "in" ? await punchInApi(location) : await punchOutApi(location);
      setAttendance(data.attendance);
      setConfirmAction(null);
    } catch (err) {
      setLocating(false);
      setError(err.response?.data?.message || err.message || "Failed to punch in/out");
    } finally {
      setBusy(false);
    }
  };

  const fmtTime = (t) => (t ? formatTime(t) : "—");
  const nowLabel = formatTime(new Date());

  return (
    <Card title="Today's Attendance">
      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-slate-500">
              <Clock size={16} /> {formatDate(new Date(), { weekday: "long", month: "short", day: "numeric" })}
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
            <Button onClick={() => openConfirm("in")} disabled={busy || attendance?.punchIn} className="flex-1">
              <LogIn size={16} /> Punch In
            </Button>
            <Button
              onClick={() => openConfirm("out")}
              disabled={busy || !attendance?.punchIn || attendance?.punchOut}
              variant="secondary"
              className="flex-1"
            >
              <LogOut size={16} /> Punch Out
            </Button>
          </div>
        </div>
      )}

      <Modal
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        title={confirmAction === "in" ? "Confirm Punch In" : "Confirm Punch Out"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmAction(null)} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={busy}>
              {locating ? "Checking location..." : busy ? "Please wait..." : "Confirm"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-500">
          {confirmAction === "in"
            ? `Punch in now at ${nowLabel}?`
            : `Punch out now at ${nowLabel}? This will end today's attendance session.`}
        </p>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
          <MapPin size={12} /> We'll check that you're at the office before confirming.
        </p>
        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      </Modal>
    </Card>
  );
}
