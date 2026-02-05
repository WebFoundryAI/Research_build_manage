import React, { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Globe,
  ShieldCheck,
  Key,
  TrendingUp,
  FileText,
  Settings,
  Menu,
  X,
  ArrowLeft,
  Activity,
} from "lucide-react";

const menuSections = [
  {
    title: "Overview",
    items: [
      { to: "/daily-checks", label: "Dashboard", icon: LayoutDashboard, end: true },
      { to: "/daily-checks/websites", label: "Websites", icon: Globe },
    ],
  },
  {
    title: "Health Checks",
    items: [
      { to: "/daily-checks/seo-health", label: "SEO Health", icon: ShieldCheck },
      { to: "/daily-checks/content-changes", label: "Content Changes", icon: FileText },
    ],
  },
  {
    title: "Tracking",
    items: [
      { to: "/daily-checks/keywords", label: "Keywords", icon: Key },
      { to: "/daily-checks/rankings", label: "GSC Rankings", icon: TrendingUp },
    ],
  },
  {
    title: "Configuration",
    items: [
      { to: "/daily-checks/settings", label: "Settings", icon: Settings },
    ],
  },
];

export default function DailyChecksLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const currentPage = menuSections
    .flatMap((s) => s.items)
    .find((item) => {
      if (item.end) return location.pathname === item.to;
      return location.pathname.startsWith(item.to);
    });

  return (
    <div className="flex min-h-[calc(100vh-120px)] -m-6">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-[73px] left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity size={18} className="text-emerald-400" />
            <span className="font-medium text-sm">{currentPage?.label || "Daily Checks"}</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 md:z-auto h-screen md:h-[calc(100vh-120px)] w-64 bg-slate-900/95 md:bg-slate-900/60 backdrop-blur-xl border-r border-slate-800 transform transition-transform duration-300 md:transform-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20">
                <Activity size={20} className="text-emerald-400" />
              </div>
              <div>
                <h2 className="font-semibold text-sm">Daily Checks</h2>
                <p className="text-[10px] text-slate-500">Website monitoring & SEO</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            {menuSections.map((section) => (
              <div key={section.title} className="mb-6">
                <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  {section.title}
                </div>
                {section.items.map(({ to, label, icon: Icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-white"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div
                          className={`p-1.5 rounded-lg transition-colors ${
                            isActive
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-slate-800/50 text-slate-500 group-hover:text-slate-300"
                          }`}
                        >
                          <Icon size={16} />
                        </div>
                        <span className="font-medium">{label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800">
            <NavLink
              to="/dashboard"
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </NavLink>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 pt-20 md:pt-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
