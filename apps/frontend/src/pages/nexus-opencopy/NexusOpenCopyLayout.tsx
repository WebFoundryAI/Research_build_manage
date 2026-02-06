import React, { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  FileEdit,
  FolderKanban,
  Search,
  FileText,
  CalendarDays,
  Link2,
  ChevronLeft,
  Menu,
  Home,
} from "lucide-react";

const navItems = [
  { to: "/nexus-opencopy", label: "Dashboard", icon: Home, end: true },
  { to: "/nexus-opencopy/projects", label: "Projects", icon: FolderKanban },
  { to: "/nexus-opencopy/keywords", label: "Keywords", icon: Search },
  { to: "/nexus-opencopy/articles", label: "Articles", icon: FileText },
  { to: "/nexus-opencopy/content-planner", label: "Content Planner", icon: CalendarDays },
  { to: "/nexus-opencopy/integrations", label: "Integrations", icon: Link2 },
];

export default function NexusOpenCopyLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0 md:w-16"
        } flex-shrink-0 border-r border-slate-200 bg-slate-50 transition-all duration-300 overflow-hidden`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-500/30">
                <FileEdit size={20} className="text-pink-600" />
              </div>
              {sidebarOpen && (
                <div>
                  <h2 className="font-semibold text-slate-900">Nexus OpenCopy</h2>
                  <p className="text-xs text-slate-500">AI Content Studio</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-pink-500/20 text-pink-700 border border-pink-500/30"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  }`
                }
              >
                <item.icon size={18} />
                {sidebarOpen && <span>{item.label}</span>}
              </NavLink>
            ))}
          </nav>

          {/* Back to main */}
          <div className="p-3 border-t border-slate-200">
            <NavLink
              to="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
            >
              <ChevronLeft size={18} />
              {sidebarOpen && <span>Back to Main</span>}
            </NavLink>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center gap-3 p-4 border-b border-slate-200">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-slate-100"
          >
            <Menu size={20} />
          </button>
          <span className="font-semibold">Nexus OpenCopy</span>
        </div>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
