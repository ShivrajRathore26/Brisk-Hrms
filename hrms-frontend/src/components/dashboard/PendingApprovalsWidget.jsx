import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardCheck } from "lucide-react";
import { getPendingApprovalsApi } from "../../api/leave.api";
import { formatDate } from "../../utils/formatters";
import Card from "../common/Card";

export default function PendingApprovalsWidget() {
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    getPendingApprovalsApi().then((data) => setLeaves(data.leaves));
  }, []);

  return (
    <Card
      title="Pending Leave Approvals"
      action={
        <Link to="/team/leave-approvals" className="text-xs font-medium text-accent-600 hover:underline">
          View all
        </Link>
      }
    >
      {leaves.length === 0 ? (
        <p className="text-sm text-slate-400">Nothing pending</p>
      ) : (
        <ul className="space-y-3">
          {leaves.slice(0, 5).map((l) => (
            <li key={l._id} className="flex items-center gap-3 text-sm">
              <ClipboardCheck size={16} className="text-amber-500" />
              <span className="text-slate-600">
                {l.user?.name} · {formatDate(l.fromDate)} - {formatDate(l.toDate)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
