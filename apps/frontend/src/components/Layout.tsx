import React from "react";
import { getTheme, setTheme, type Theme } from "../lib/theme";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { BarChart3, Globe, Search, Settings, Shield, CalendarClock, User } from "lucide-react";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/websites", label: "Websites", icon: Globe },
  { to: "/research", label: "Research", icon: Search },
  { to: "/planner", label: "Planner", icon: CalendarClock },
  { to: "/admin", label: "Admin", icon: Shield },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Layout() {
  const { mode, user, error, signOut } = useAuth();
  const [theme, setThemeState] = React.useState<Theme>(() => getTheme());

  const toggleTheme = React.useCallback(() => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    setThemeState(nextTheme);
  }, [theme]);

  return (
    <div
      className={
        "min-h-screen " +
        (theme === "light" ? "bg-slate-100 text-slate-900" : "bg-slate-950 text-slate-100")
      }
    >
      <div className="flex">
        <aside
          className={
            "hidden md:flex w-64 flex-col border-r " +
            (theme === "light" ? "border-slate-300 bg-white/80" : "border-slate-800 bg-slate-950/60")
          }
        >
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
                  (theme === "light"
                    ? isActive
                      ? "bg-slate-200"
                      : "hover:bg-slate-100"
                    : isActive
                    ? "bg-slate-800/60"
                    : "hover:bg-slate-900/50")
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className={`mt-auto px-5 py-4 border-t ${theme === "light" ? "border-slate-300" : "border-slate-800"}`}>
            <div className="text-xs opacity-70">Signed in</div>
            <div className="text-sm font-medium">{user?.email ?? "Unknown"}</div>
            <button
              onClick={() => signOut()}
              className={`mt-3 w-full rounded-lg px-3 py-2 text-sm ${theme === "light" ? "bg-slate-200 hover:bg-slate-300" : "bg-slate-800 hover:bg-slate-700"}` }
            >
              Sign out
            </button>
          </div>
        </aside>

        <main className="flex-1">
          <header
            className={
              "sticky top-0 z-10 border-b backdrop-blur " +
              (theme === "light"
                ? "border-slate-300 bg-white/80"
                : "border-slate-800 bg-slate-950/70")
            }
          >
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="md:hidden text-sm font-semibold">RBM</div>
              <div className="text-xs opacity-70">
                <div className="flex items-center gap-3">
                <button
                  onClick={toggleTheme}
                  className={`rounded-lg border px-3 py-1.5 text-xs ${theme === "light" ? "border-slate-300 bg-white text-slate-900 hover:bg-slate-100" : "border-slate-700 bg-slate-900/60 text-slate-100 hover:bg-slate-800"}` }
                >
                  Theme: {theme === "dark" ? "Dark" : "Light"}
                </button>
                <div>{error ? <span className="text-amber-300">Auth warning: {error}</span> : "OK"}</div>
              </div>
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
