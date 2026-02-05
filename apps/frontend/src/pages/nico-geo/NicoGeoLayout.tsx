import React, { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Globe2,
  FileText,
  Search,
  Sparkles,
  ClipboardCheck,
  Key,
  Settings,
  ChevronLeft,
  Menu,
  Home,
} from "lucide-react";

const navItems = [
  { to: "/nico-geo", label: "Dashboard", icon: Home, end: true },
  { to: "/nico-geo/generate", label: "Generate Content", icon: Sparkles },
  { to: "/nico-geo/audit", label: "Audit Content", icon: Search },
  { to: "/nico-geo/improve", label: "Improve Content", icon: FileText },
  { to: "/nico-geo/reviews", label: "Review Sessions", icon: ClipboardCheck },
  { to: "/nico-geo/api-keys", label: "API Keys", icon: Key },
  { to: "/nico-geo/settings", label: "Settings", icon: Settings },
];

export default function NicoGeoLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0 md:w-16"
        } flex-shrink-0 border-r border-slate-800 bg-slate-900/50 transition-all duration-300 overflow-hidden`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30">
                <Globe2 size={20} className="text-teal-400" />
              </div>
              {sidebarOpen && (
                <div>
                  <h2 className="font-semibold text-white">Nico GEO</h2>
                  <p className="text-xs text-slate-500">Content Engine</p>
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
                      ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  }`
                }
              >
                <item.icon size={18} />
                {sidebarOpen && <span>{item.label}</span>}
              </NavLink>
            ))}
          </nav>

          {/* Back to main */}
          <div className="p-3 border-t border-slate-800">
            <NavLink
              to="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
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
        <div className="md:hidden flex items-center gap-3 p-4 border-b border-slate-800">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-slate-800"
          >
            <Menu size={20} />
          </button>
          <span className="font-semibold">Nico GEO</span>
        </div>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
