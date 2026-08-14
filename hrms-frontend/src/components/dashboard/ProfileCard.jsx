import { useAuth } from "../../context/AuthContext";
import Card from "../common/Card";

export default function ProfileCard() {
  const { user } = useAuth();
  return (
    <Card title="Profile">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-accent-100 text-lg font-semibold text-accent-700">
          {user?.profilePhoto ? (
            <img src={user.profilePhoto} alt={user.name} className="h-full w-full object-cover" />
          ) : (
            user?.name?.[0]?.toUpperCase()
          )}
        </div>
        <div>
          <p className="font-semibold text-slate-800">{user?.name}</p>
          <p className="text-sm text-slate-500">{user?.designation || "—"}</p>
          <p className="text-xs text-slate-400">{user?.department?.name || "No department"}</p>
        </div>
      </div>
    </Card>
  );
}
