import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ChevronDown, LogOut, Menu, Search, Settings } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { getUsersApi } from "../../api/user.api";
import EmployeeDetailModal from "../hr/EmployeeDetailModal";

export default function Topbar({ onMenuClick = () => {} }) {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();

  const canSearch = ["hr", "super_admin"].includes(user?.role);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [detailUserId, setDetailUserId] = useState(null);

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowResults(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!canSearch || !query.trim()) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => {
      getUsersApi({ search: query }).then((data) => setResults(data.users.slice(0, 8)));
    }, 300);
    return () => clearTimeout(t);
  }, [query, canSearch]);

  const openEmployee = (id) => {
    setDetailUserId(id);
    setShowResults(false);
    setQuery("");
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-slate-100 bg-white px-3 sm:px-6">
      <button
        onClick={onMenuClick}
        title="Open menu"
        aria-label="Open menu"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 md:hidden"
      >
        <Menu size={20} />
      </button>

      <div className="flex min-w-0 max-w-sm flex-1">
        {canSearch && (
          <div ref={searchRef} className="relative hidden w-full sm:block">
            <div className="flex items-center gap-2 rounded-lg border border-transparent bg-slate-50 px-3 py-2 transition-colors focus-within:border-accent-500 focus-within:bg-white focus-within:ring-1 focus-within:ring-accent-500">
              <Search size={16} className="shrink-0 text-slate-400" />
              <input
                placeholder="Search employees..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>
            {showResults && query.trim() && (
              <div className="absolute left-0 right-0 z-20 mt-2 max-h-80 overflow-y-auto rounded-card border border-slate-100 bg-white p-1.5 shadow-popover animate-scale-in">
                {results.length === 0 ? (
                  <p className="px-3 py-4 text-center text-sm text-slate-400">No employees found</p>
                ) : (
                  results.map((r) => (
                    <button
                      key={r._id}
                      onClick={() => openEmployee(r._id)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-slate-50"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent-100 text-xs font-semibold text-accent-700">
                        {r.profilePhoto ? (
                          <img src={r.profilePhoto} alt={r.name} className="h-full w-full object-cover" />
                        ) : (
                          r.name?.[0]?.toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-700">{r.name}</p>
                        <p className="truncate text-xs text-slate-400">
                          {r.designation || r.email} {r.department?.name ? `· ${r.department.name}` : ""}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifs((s) => !s)}
            title="Notifications"
            aria-label="Notifications"
            className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white ring-2 ring-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          {showNotifs && (
            <div className="fixed inset-x-3 top-16 z-20 mt-2 rounded-card border border-slate-100 bg-white p-3 shadow-popover animate-scale-in sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:w-80">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">Notifications</p>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs font-medium text-accent-600 hover:underline">
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
                    className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      n.read ? "text-slate-500 hover:bg-slate-50" : "bg-accent-50 text-slate-700 hover:bg-accent-100"
                    }`}
                  >
                    {n.message}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mx-1 h-6 w-px bg-slate-100" />

        <div ref={profileRef} className="relative">
          <button
            onClick={() => setShowProfile((s) => !s)}
            className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-slate-100"
          >
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-accent-100 text-sm font-semibold text-accent-700">
              {user?.profilePhoto ? (
                <img src={user.profilePhoto} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                user?.name?.[0]?.toUpperCase()
              )}
            </div>
            <div className="hidden text-left md:block">
              <p className="text-sm font-medium leading-tight text-slate-700">{user?.name}</p>
              <p className="text-xs capitalize leading-tight text-slate-400">{user?.role?.replace("_", " ")}</p>
            </div>
            <ChevronDown size={16} className={`text-slate-400 transition-transform ${showProfile ? "rotate-180" : ""}`} />
          </button>
          {showProfile && (
            <div className="absolute right-0 z-20 mt-2 w-48 rounded-card border border-slate-100 bg-white p-1.5 shadow-popover animate-scale-in">
              <button
                onClick={() => {
                  setShowProfile(false);
                  navigate("/profile");
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50"
              >
                <Settings size={16} /> My Profile
              </button>
              <button
                onClick={logout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 transition-colors hover:bg-red-50"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {detailUserId && <EmployeeDetailModal userId={detailUserId} onClose={() => setDetailUserId(null)} />}
    </header>
  );
}
