import { useAuth } from "../../context/AuthContext";
import { formatDate } from "../../utils/formatters";
import PunchCard from "../../components/dashboard/PunchCard";
import ProfileCard from "../../components/dashboard/ProfileCard";
import LeaveBalanceWidget from "../../components/dashboard/LeaveBalanceWidget";
import UpcomingHoliday from "../../components/dashboard/UpcomingHoliday";
import RecentActivity from "../../components/dashboard/RecentActivity";
import PendingApprovalsWidget from "../../components/dashboard/PendingApprovalsWidget";

export default function Dashboard() {
  const { user } = useAuth();
  const isApprover = ["manager", "hr", "super_admin"].includes(user?.role);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Welcome back, {user?.name?.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {formatDate(new Date(), { weekday: "long", month: "long", day: "numeric" })} — here's
          what's happening today.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PunchCard />
        <ProfileCard />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <LeaveBalanceWidget />
        <UpcomingHoliday />
      </div>

      {isApprover && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <PendingApprovalsWidget />
          <RecentActivity />
        </div>
      )}

      {!isApprover && <RecentActivity />}
    </div>
  );
}
