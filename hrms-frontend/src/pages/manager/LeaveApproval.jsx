import { useEffect, useState } from "react";
import { getPendingApprovalsApi, decideLeaveApi } from "../../api/leave.api";
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
    { key: "leaveType", label: "Type", render: (r) => <span className="capitalize">{r.leaveType}</span> },
    {
      key: "dates",
      label: "Dates",
      render: (r) => `${new Date(r.fromDate).toLocaleDateString()} - ${new Date(r.toDate).toLocaleDateString()}`,
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
            Approve
          </Button>
          <Button
            variant="danger"
            className="!px-3 !py-1 text-xs"
            disabled={busyId === r._id}
            onClick={() => decide(r._id, "rejected")}
          >
            Reject
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-800">Pending Leave Approvals</h1>
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
