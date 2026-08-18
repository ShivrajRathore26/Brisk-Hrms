import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { getPendingApprovalsApi, decideLeaveApi } from "../../api/leave.api";
import { formatDate } from "../../utils/formatters";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";

export default function LeaveApproval() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    getPendingApprovalsApi()
      .then((data) => setLeaves(data.leaves))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const decide = async (id, decision) => {
    setBusyId(id);
    try {
      await decideLeaveApi(id, decision);
      load();
    } finally {
      setBusyId(null);
    }
  };

  const columns = [
    { key: "employee", label: "Employee", render: (r) => r.user?.name },
    {
      key: "dates",
      label: "Dates",
      render: (r) => `${formatDate(r.fromDate)} - ${formatDate(r.toDate)}`,
    },
    {
      key: "days",
      label: "Days",
      render: (r) => Math.floor((new Date(r.toDate) - new Date(r.fromDate)) / (1000 * 60 * 60 * 24)) + 1,
    },
    { key: "reason", label: "Reason" },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="flex gap-2">
          <Button
            variant="primary"
            className="!px-3 !py-1 text-xs"
            disabled={busyId === r._id}
            onClick={() => decide(r._id, "approved")}
          >
            <Check size={14} /> Approve
          </Button>
          <Button
            variant="danger"
            className="!px-3 !py-1 text-xs"
            disabled={busyId === r._id}
            onClick={() => decide(r._id, "rejected")}
          >
            <X size={14} /> Reject
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Pending Leave Approvals</h1>
        <p className="text-sm text-slate-400">
          Approving is never blocked by balance — days beyond what an employee has available are automatically
          marked unpaid.
        </p>
      </div>
      <Card>
        {loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : (
          <Table columns={columns} rows={leaves} emptyMessage="No pending leave requests" />
        )}
      </Card>
    </div>
  );
}
