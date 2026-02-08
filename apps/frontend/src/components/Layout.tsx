import React, { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";
import {
  BarChart3,
  Settings,
  Shield,
  User,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Sparkles,
  Zap,
  CalendarCheck,
  Package,
  Globe2,
  FileEdit,
} from "lucide-react";

const navSections = [
  {
    title: "Overview",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: BarChart3, desc: "Analytics & insights" },
    ],
  },
  {
    title: "Modules",
    items: [
      { to: "/mcp-spark", label: "Multi-tools", icon: Zap, desc: "SEO & scraping suite" },
      { to: "/build", label: "Build", icon: Sparkles, desc: "Workflow automation" },
      { to: "/daily-checks", label: "Daily Checks", icon: CalendarCheck, desc: "Website monitoring & SEO" },
      { to: "/asset-tracker", label: "Asset Tracker", icon: Package, desc: "Portfolio management" },
      { to: "/nico-geo", label: "Nico GEO", icon: Globe2, desc: "GEO content engine" },
      { to: "/nexus-opencopy", label: "Nexus OpenCopy", icon: FileEdit, desc: "AI content studio" },
    ],
  },
  {
    title: "Settings",
    items: [
      { to: "/admin", label: "Admin", icon: Shield, desc: "System configuration" },
      { to: "/profile", label: "Profile", icon: User, desc: "Your account" },
      { to: "/settings", label: "Settings", icon: Settings, desc: "Preferences" },
    ],
  },
];

export default function Layout() {
  const { mode, user, error, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const visibleSections = navSections.map((section) => ({
    ...section,
    items: section.items.filter((item) => item.to !== "/admin" || user?.isAdmin),
  }));

  const currentPage = visibleSections
    .flatMap((s) => s.items)
    .find((item) => {
      if (item.to === "/mcp-spark") {
        return location.pathname.startsWith("/mcp-spark");
      }
      if (item.to === "/daily-checks") {
        return location.pathname.startsWith("/daily-checks");
      }
      if (item.to === "/asset-tracker") {
        return location.pathname.startsWith("/asset-tracker");
      }
      if (item.to === "/nico-geo") {
        return location.pathname.startsWith("/nico-geo");
      }
      if (item.to === "/nexus-opencopy") {
        return location.pathname.startsWith("/nexus-opencopy");
      }
      return location.pathname === item.to || (item.to !== "/" && location.pathname.startsWith(item.to + "/"));
    });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300">
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-semibold text-sm">RBM</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`md:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">WebFoundryAI</div>
                <div className="font-semibold">Research Build Manage</div>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3">
            {visibleSections.map((section) => (
              <div key={section.title} className="mb-6">
                <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  {section.title}
                </div>
                {section.items.map(({ to, label, icon: Icon, desc }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/10 text-slate-900 shadow-lg shadow-indigo-500/5"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div
                          className={`p-1.5 rounded-lg transition-colors ${
                            isActive
                              ? "bg-indigo-500/20 text-indigo-600"
                              : "bg-slate-100 text-slate-400 group-hover:text-slate-600"
                          }`}
                        >
                          <Icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{label}</div>
                          <div className="text-[10px] text-slate-400 truncate">{desc}</div>
                        </div>
                        {isActive && (
                          <ChevronRight size={14} className="text-indigo-600" />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-sm font-medium">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{user?.email || "Unknown"}</div>
                <div className="text-[10px] text-slate-400">Mode: {mode}</div>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 px-4 py-2.5 text-sm font-medium transition-colors"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 flex-col fixed top-0 left-0 bottom-0 border-r border-slate-200 bg-white/80 backdrop-blur-xl">
          {/* Brand Header */}
          <div className="p-5 border-b border-slate-200/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                  WebFoundryAI
                </div>
                <div className="font-semibold text-sm">Research Build Manage</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            {visibleSections.map((section) => (
              <div key={section.title} className="mb-6">
                <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  {section.title}
                </div>
                {section.items.map(({ to, label, icon: Icon, desc }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/10 text-slate-900 shadow-lg shadow-indigo-500/5"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div
                          className={`p-1.5 rounded-lg transition-colors ${
                            isActive
                              ? "bg-indigo-500/20 text-indigo-600"
                              : "bg-slate-100 text-slate-400 group-hover:text-slate-600"
                          }`}
                        >
                          <Icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{label}</div>
                          <div className="text-[10px] text-slate-400 truncate">{desc}</div>
                        </div>
                        {isActive && (
                          <ChevronRight size={14} className="text-indigo-600" />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-slate-200/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-sm font-medium ring-2 ring-slate-200">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-200" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{user?.email || "Unknown"}</div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Online
                </div>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 px-4 py-2.5 text-sm font-medium transition-all duration-200"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-64">
          {/* Top Header */}
          <header className="sticky top-0 z-30 border-b border-slate-200/50 bg-white/80 backdrop-blur-xl">
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3 pt-12 md:pt-0">
                {currentPage && (
                  <>
                    <div className="p-2 rounded-lg bg-slate-100">
                      <currentPage.icon size={18} className="text-indigo-600" />
                    </div>
                    <div>
                      <h1 className="font-semibold">{currentPage.label}</h1>
                      <p className="text-xs text-slate-400">{currentPage.desc}</p>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3">
                {error ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-xs text-amber-600">{error}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs text-emerald-600">System OK</span>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
