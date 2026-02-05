import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { BarChart3, Globe, Search, Settings, Shield, CalendarClock, User, Briefcase, Activity, FileText, CheckSquare } from "lucide-react";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/websites", label: "Monitor", icon: Activity, desc: "Website health & SEO" },
  { to: "/projects", label: "Portfolio", icon: Briefcase, desc: "Asset management" },
  { to: "/tasks", label: "Tasks", icon: CheckSquare, desc: "All project tasks" },
  { to: "/research", label: "Research", icon: Search, desc: "SEO & content tools" },
  { to: "/planner", label: "Content", icon: FileText, desc: "Copy generation" },
  { to: "/admin", label: "Admin", icon: Shield },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Layout() {
  const { mode, user, error, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex">
        <aside className="hidden md:flex w-64 flex-col border-r border-slate-800 bg-slate-950/60">
          <div className="px-5 py-4">
            <div className="text-sm opacity-70">WebFoundryAI</div>
            <div className="text-lg font-semibold">Research Build Manage</div>
            <div className="mt-2 text-xs opacity-70">Mode: {mode}</div>
          </div>

          <nav className="px-2 pb-4">
            {nav.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm " +
                  (isActive ? "bg-slate-800/60" : "hover:bg-slate-900/50")
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto px-5 py-4 border-t border-slate-800">
            <div className="text-xs opacity-70">Signed in</div>
            <div className="text-sm font-medium">{user?.email ?? "Unknown"}</div>
            <button
              onClick={() => signOut()}
              className="mt-3 w-full rounded-lg bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700"
            >
              Sign out
            </button>
          </div>
        </aside>

        <main className="flex-1">
          <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/70 backdrop-blur">
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="md:hidden text-sm font-semibold">RBM</div>
              <div className="text-xs opacity-70">
                {error ? <span className="text-amber-300">Auth warning: {error}</span> : "OK"}
              </div>
            </div>
          </header>

          <div className="p-5">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
