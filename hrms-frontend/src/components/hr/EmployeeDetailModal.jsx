import { useEffect, useState } from "react";
import { Laptop, Monitor, Mouse, Keyboard, Package, Check, X } from "lucide-react";
import { getUserApi } from "../../api/user.api";
import { getUserBalanceApi, getUserLeavesApi, decideLeaveApi } from "../../api/leave.api";
import { getUserAttendanceSummaryApi } from "../../api/attendance.api";
import { getAssetHistoryApi } from "../../api/asset.api";
import { formatDate, formatMonthName } from "../../utils/formatters";
import Modal from "../common/Modal";
import Card from "../common/Card";
import Badge from "../common/Badge";
import Button from "../common/Button";
import Table from "../common/Table";
import StatTile from "../common/StatTile";
import Select from "../common/Select";

const assetIcons = { laptop: Laptop, monitor: Monitor, mouse: Mouse, keyboard: Keyboard, other: Package };
const attendanceTone = { present: "green", late: "yellow", half_day: "yellow", absent: "red", leave: "slate" };
const leaveTone = { pending: "yellow", approved: "green", rejected: "red" };
const months = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: formatMonthName(i),
}));

function leaveDays(l) {
  return Math.floor((new Date(l.toDate) - new Date(l.fromDate)) / (1000 * 60 * 60 * 24)) + 1;
}

export default function EmployeeDetailModal({ userId, onClose }) {
  const now = new Date();
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [attendance, setAttendance] = useState({ summary: {} });
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [decidingId, setDecidingId] = useState(null);
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));

  const load = (m = month, y = year) => {
    setLoading(true);
    Promise.all([
      getUserApi(userId),
      getUserBalanceApi(userId),
      getUserLeavesApi(userId),
      getUserAttendanceSummaryApi(userId, { month: m, year: y }),
      getAssetHistoryApi(userId),
    ])
      .then(([userRes, balanceRes, leavesRes, attendanceRes, assetsRes]) => {
        setUser(userRes.user);
        setBalance(balanceRes.balance);
        setLeaves(leavesRes.leaves);
        setAttendance(attendanceRes);
        setAssignments(assetsRes.assignments);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!userId) return;
    const currentMonth = String(now.getMonth() + 1);
    const currentYear = String(now.getFullYear());
    setMonth(currentMonth);
    setYear(currentYear);
    load(currentMonth, currentYear);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (!userId || loading) return;
    getUserAttendanceSummaryApi(userId, { month, year }).then(setAttendance);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  const decide = async (id, decision) => {
    setDecidingId(id);
    try {
      await decideLeaveApi(id, decision);
      load();
    } finally {
      setDecidingId(null);
    }
  };

  const pendingLeaves = leaves.filter((l) => l.status === "pending");

  const leaveColumns = [
    { key: "dates", label: "Dates", render: (r) => `${formatDate(r.fromDate)} - ${formatDate(r.toDate)}` },
    { key: "days", label: "Days", render: leaveDays },
    { key: "reason", label: "Reason" },
    { key: "status", label: "Status", render: (r) => <Badge tone={leaveTone[r.status]}>{r.status}</Badge> },
    {
      key: "unpaidDays",
      label: "Unpaid",
      render: (r) => (r.unpaidDays > 0 ? <Badge tone="red">{r.unpaidDays} unpaid</Badge> : "—"),
    },
  ];

  const assetColumns = [
    {
      key: "asset",
      label: "Asset",
      render: (r) => {
        const Icon = assetIcons[r.asset?.assetType] || Package;
        return (
          <span className="flex items-center gap-2">
            <Icon size={14} className="text-slate-400" />
            <span className="capitalize">{r.asset?.assetType}</span> · {r.asset?.modelName || r.asset?.description || "—"}
          </span>
        );
      },
    },
    { key: "assignedDate", label: "Assigned", render: (r) => formatDate(r.assignedDate) },
    {
      key: "status",
      label: "Status",
      render: (r) => (r.returnedDate ? <Badge tone="slate">Returned</Badge> : <Badge tone="indigo">Active</Badge>),
    },
  ];

  return (
    <Modal open={!!userId} onClose={onClose} title="Employee Details" size="lg">
      {loading || !user ? (
        <p className="py-12 text-center text-sm text-slate-400">Loading...</p>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent-100 text-lg font-semibold text-accent-700">
              {user.profilePhoto ? (
                <img src={user.profilePhoto} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                user.name?.[0]?.toUpperCase()
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-base font-semibold text-slate-800">{user.name}</p>
                <Badge tone={user.status === "active" ? "green" : "slate"}>{user.status}</Badge>
              </div>
              <p className="text-sm text-slate-500">
                {user.designation || "—"} · {user.department?.name || "No department"}
              </p>
              <p className="text-xs text-slate-400">
                {user.email} · <span className="capitalize">{user.role.replace("_", " ")}</span> · Manager:{" "}
                {user.manager?.name || "—"} · Joined {formatDate(user.joiningDate)}
              </p>
            </div>
          </div>

          <Card
            title="Attendance"
            action={
              <div className="flex gap-2">
                <Select value={month} onChange={(e) => setMonth(e.target.value)} options={months} className="w-32 !py-1.5" />
                <Select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  options={[0, 1, 2].map((i) => {
                    const y = now.getFullYear() - i;
                    return { value: String(y), label: String(y) };
                  })}
                  className="w-24 !py-1.5"
                />
              </div>
            }
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {["present", "late", "half_day", "absent"].map((s) => (
                <StatTile key={s} value={attendance.summary[s] || 0} label={s.replace("_", " ")} />
              ))}
            </div>
          </Card>

          <Card title="Leave Balance">
            <div className="grid grid-cols-3 gap-3">
              <StatTile value={balance?.available ?? "—"} label="Available" />
              <StatTile value={balance?.accrued ?? "—"} label="Accrued" />
              <StatTile value={balance?.used ?? "—"} label="Used" />
            </div>
          </Card>

          {pendingLeaves.length > 0 && (
            <Card title="Pending Leave Requests" className="border border-amber-200">
              <ul className="space-y-3">
                {pendingLeaves.map((l) => (
                  <li key={l._id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="text-slate-600">
                      {formatDate(l.fromDate)} - {formatDate(l.toDate)} (
                      {leaveDays(l)} day{leaveDays(l) > 1 ? "s" : ""}) — {l.reason}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        className="!px-3 !py-1 text-xs"
                        disabled={decidingId === l._id}
                        onClick={() => decide(l._id, "approved")}
                      >
                        <Check size={14} /> Approve
                      </Button>
                      <Button
                        variant="danger"
                        className="!px-3 !py-1 text-xs"
                        disabled={decidingId === l._id}
                        onClick={() => decide(l._id, "rejected")}
                      >
                        <X size={14} /> Reject
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card title="Leave History">
            <Table columns={leaveColumns} rows={leaves} emptyMessage="No leave requests yet" />
          </Card>

          <Card title="Assets">
            <Table columns={assetColumns} rows={assignments} emptyMessage="No assets assigned" />
          </Card>
        </div>
      )}
    </Modal>
  );
}
