import { NavLink } from "react-router-dom";
import { X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { navSections } from "./navConfig";
import Logo from "../common/Logo";

export default function Sidebar({ open = false, onClose = () => {} }) {
  const { user } = useAuth();

  return (
    <>
      {/* Backdrop — mobile only, shown while the drawer is open */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm animate-fade-in md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] shrink-0 flex-col border-r border-slate-100 bg-white px-3 py-6 transition-transform duration-200 ease-out md:static md:z-auto md:w-64 md:max-w-none md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-center justify-between px-3">
          <Logo size="sm" />
          <button
            onClick={onClose}
            title="Close menu"
            aria-label="Close menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 md:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-1">
          {navSections.map((section, i) => {
            const items = section.items.filter((item) => item.roles.includes(user?.role));
            if (items.length === 0) return null;
            return (
              <div key={i}>
                {section.title && (
                  <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {section.title}
                  </p>
                )}
                <div className="space-y-0.5">
                  {items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                          isActive
                            ? "bg-accent-50 text-accent-700"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <span className="absolute -left-1 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-accent-500" />
                          )}
                          <item.icon
                            size={18}
                            className={isActive ? "text-accent-600" : "text-slate-400 group-hover:text-slate-500"}
                          />
                          {item.label}
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
