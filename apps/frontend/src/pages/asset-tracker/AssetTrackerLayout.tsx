import React, { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Globe,
  Columns,
  CheckSquare,
  Activity,
  FileBarChart,
  ClipboardList,
  Bell,
  Trash2,
  Menu,
  X,
  ArrowLeft,
  Package,
} from "lucide-react";

const menuSections = [
  {
    title: "Overview",
    items: [
      { to: "/asset-tracker", label: "Dashboard", icon: LayoutDashboard, end: true },
      { to: "/asset-tracker/alerts", label: "Alerts", icon: Bell },
    ],
  },
  {
    title: "Assets",
    items: [
      { to: "/asset-tracker/projects", label: "Projects", icon: Globe },
      { to: "/asset-tracker/board", label: "Board", icon: Columns },
      { to: "/asset-tracker/tasks", label: "Tasks", icon: CheckSquare },
    ],
  },
  {
    title: "Monitoring",
    items: [
      { to: "/asset-tracker/health", label: "Health", icon: Activity },
      { to: "/asset-tracker/reports", label: "Reports", icon: FileBarChart },
      { to: "/asset-tracker/ops-review", label: "Ops Review", icon: ClipboardList },
    ],
  },
  {
    title: "Management",
    items: [
      { to: "/asset-tracker/trash", label: "Trash", icon: Trash2 },
    ],
  },
];

export default function AssetTrackerLayout() {
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
      <div className="md:hidden fixed top-[73px] left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package size={18} className="text-blue-600" />
            <span className="font-medium text-sm">{currentPage?.label || "Asset Tracker"}</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
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
        className={`fixed md:sticky top-0 left-0 z-50 md:z-auto h-screen md:h-[calc(100vh-120px)] w-64 bg-white md:bg-slate-50 backdrop-blur-xl border-r border-slate-200 transform transition-transform duration-300 md:transform-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/20">
                <Package size={20} className="text-blue-600" />
              </div>
              <div>
                <h2 className="font-semibold text-sm">Asset Tracker</h2>
                <p className="text-[10px] text-slate-500">Portfolio management</p>
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
                          ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/10 text-slate-900"
                          : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div
                          className={`p-1.5 rounded-lg transition-colors ${
                            isActive
                              ? "bg-blue-500/20 text-blue-600"
                              : "bg-slate-100 text-slate-500 group-hover:text-slate-600"
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
          <div className="p-4 border-t border-slate-200">
            <NavLink
              to="/dashboard"
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
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
