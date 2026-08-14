import { useAuth } from "../../context/AuthContext";
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
        <h1 className="text-xl font-semibold text-slate-800">Welcome back, {user?.name?.split(" ")[0]}</h1>
        <p className="text-sm text-slate-400">Here's what's happening today.</p>
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
