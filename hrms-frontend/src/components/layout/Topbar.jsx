import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ChevronDown, LogOut, Search, Settings } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";

export default function Topbar() {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-100 bg-white px-6">
      <div className="flex max-w-sm flex-1 items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
        <Search size={16} className="text-slate-400" />
        <input
          placeholder="Search..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setShowNotifs((s) => !s)}
            className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-50"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          {showNotifs && (
            <div className="absolute right-0 z-20 mt-2 w-80 rounded-card border border-slate-100 bg-white p-3 shadow-lg">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">Notifications</p>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-accent-600 hover:underline">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 space-y-1 overflow-y-auto">
                {notifications.length === 0 && (
                  <p className="py-6 text-center text-sm text-slate-400">No notifications</p>
                )}
                {notifications.map((n) => (
                  <button
                    key={n._id}
                    onClick={() => markRead(n._id)}
                    className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${
                      n.read ? "text-slate-500" : "bg-accent-50 text-slate-700"
                    }`}
                  >
                    {n.message}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button onClick={() => setShowProfile((s) => !s)} className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-accent-100 text-sm font-semibold text-accent-700">
              {user?.profilePhoto ? (
                <img src={user.profilePhoto} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                user?.name?.[0]?.toUpperCase()
              )}
            </div>
            <div className="hidden text-left md:block">
              <p className="text-sm font-medium text-slate-700">{user?.name}</p>
              <p className="text-xs capitalize text-slate-400">{user?.role?.replace("_", " ")}</p>
            </div>
            <ChevronDown size={16} className="text-slate-400" />
          </button>
          {showProfile && (
            <div className="absolute right-0 z-20 mt-2 w-44 rounded-card border border-slate-100 bg-white p-1.5 shadow-lg">
              <button
                onClick={() => {
                  setShowProfile(false);
                  navigate("/profile");
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                <Settings size={16} /> My Profile
              </button>
              <button
                onClick={logout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
