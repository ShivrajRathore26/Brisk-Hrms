import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { navSections } from "./navConfig";
import Logo from "../common/Logo";

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-100 bg-white px-4 py-6 md:flex">
      <div className="mb-8 px-2">
        <Logo size="sm" />
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto">
        {navSections.map((section, i) => {
          const items = section.items.filter((item) => item.roles.includes(user?.role));
          if (items.length === 0) return null;
          return (
            <div key={i}>
              {section.title && (
                <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {section.title}
                </p>
              )}
              <div className="space-y-1">
                {items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                        isActive
                          ? "bg-accent-50 text-accent-700"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                      }`
                    }
                  >
                    <item.icon size={18} />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
