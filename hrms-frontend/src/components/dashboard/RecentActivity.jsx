import { useNotifications } from "../../context/NotificationContext";
import Card from "../common/Card";

export default function RecentActivity() {
  const { notifications } = useNotifications();
  const recent = notifications.slice(0, 6);

  return (
    <Card title="Recent Activity">
      {recent.length === 0 ? (
        <p className="text-sm text-slate-400">No recent activity</p>
      ) : (
        <ul className="space-y-3">
          {recent.map((n) => (
            <li key={n._id} className="text-sm">
              <p className="text-slate-600">{n.message}</p>
              <p className="text-xs text-slate-400">{new Date(n.createdAt).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
