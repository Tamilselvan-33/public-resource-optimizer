import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const navItems = [
  { to: "/admin-dashboard", label: "Dashboard", icon: "🏠" },
  { to: "/admin/users", label: "Users", icon: "👥" },
  { to: "/admin/villages", label: "Villages", icon: "🏡" },
  { to: "/admin/requests", label: "Requests", icon: "🚨" },
  { to: "/admin/map", label: "Map Allocation", icon: "🗺️" }
];

export default function Sidebar() {
  const { user } = useAuth();
  if (!user || user.role !== "admin") return null;

  return (
    <aside className="hidden md:flex md:flex-col w-56 border-r border-slate-800 bg-slate-950/95">
      <div className="px-4 py-3 border-b border-slate-800">
        <div className="text-xs uppercase tracking-wide text-slate-500">Admin</div>
        <div className="text-sm font-semibold text-slate-100 mt-1">Control Panel</div>
      </div>
      <nav className="flex-1 px-2 py-3 space-y-1 text-sm">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-md ${
                isActive
                  ? "bg-blue-600/20 text-blue-300 border border-blue-500/40"
                  : "text-slate-300 hover:bg-slate-800/80"
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

