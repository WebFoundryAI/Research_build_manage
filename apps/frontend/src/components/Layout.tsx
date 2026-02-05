import React, { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { useTheme } from "../lib/ThemeContext";
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
  Sun,
  Moon,
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
      { to: "/mcp-spark", label: "MCP Spark", icon: Zap, desc: "27 SEO & scraping tools" },
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
  const { mode: themeMode, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const currentPage = navSections
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
    <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 transition-colors duration-300">
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 border-b border-neutral-200 bg-white/95 dark:border-white/[0.08] dark:bg-neutral-950/95 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-semibold text-sm bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">RBM</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-white/[0.06] transition-colors"
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
        className={`md:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-white border-r border-neutral-200 dark:bg-neutral-925 dark:border-white/[0.08] transform transition-transform duration-300 ease-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-neutral-200 dark:border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">WebFoundryAI</div>
                <div className="font-semibold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">Research Build Manage</div>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3">
            {navSections.map((section) => (
              <div key={section.title} className="mb-6">
                <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
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
                          ? "bg-gradient-to-r from-primary-500/15 to-secondary-500/10 text-neutral-900 dark:text-white shadow-lg shadow-primary-500/5"
                          : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-white/[0.06]"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div
                          className={`p-1.5 rounded-lg transition-colors ${
                            isActive
                              ? "bg-primary-500/20 text-primary-600 dark:text-primary-400"
                              : "bg-neutral-100 text-neutral-400 group-hover:text-neutral-600 dark:bg-white/[0.06] dark:text-neutral-500 dark:group-hover:text-neutral-300"
                          }`}
                        >
                          <Icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{label}</div>
                          <div className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate">{desc}</div>
                        </div>
                        {isActive && (
                          <ChevronRight size={14} className="text-primary-500 dark:text-primary-400" />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>

          <div className="p-4 border-t border-neutral-200 dark:border-white/[0.08]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-sm font-medium text-white shadow-lg shadow-primary-500/20">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{user?.email || "Unknown"}</div>
                <div className="text-[10px] text-neutral-400 dark:text-neutral-500">Mode: {mode}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center gap-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] px-3 py-2.5 text-sm font-medium transition-all duration-200"
                title={themeMode === "light" ? "Switch to dark mode" : "Switch to light mode"}
              >
                {themeMode === "light" ? <Moon size={16} /> : <Sun size={16} className="text-amber-400" />}
              </button>
              <button
                onClick={() => signOut()}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] px-4 py-2.5 text-sm font-medium transition-all duration-200"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 flex-col fixed top-0 left-0 bottom-0 border-r border-neutral-200 bg-white/80 dark:border-white/[0.06] dark:bg-neutral-925/80 backdrop-blur-xl">
          {/* Brand Header */}
          <div className="p-5 border-b border-neutral-200/50 dark:border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg shadow-primary-500/30 dark:shadow-primary-500/20">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <div className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium uppercase tracking-wider">
                  WebFoundryAI
                </div>
                <div className="font-semibold text-sm bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">Research Build Manage</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            {navSections.map((section) => (
              <div key={section.title} className="mb-6">
                <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  {section.title}
                </div>
                {section.items.map(({ to, label, icon: Icon, desc }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-primary-500/15 to-secondary-500/10 text-neutral-900 dark:text-white shadow-lg shadow-primary-500/5 dark:shadow-primary-500/10"
                          : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-white/[0.06]"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div
                          className={`p-1.5 rounded-lg transition-colors ${
                            isActive
                              ? "bg-primary-500/20 text-primary-600 dark:text-primary-400"
                              : "bg-neutral-100 text-neutral-400 group-hover:text-neutral-600 dark:bg-white/[0.06] dark:text-neutral-500 dark:group-hover:text-neutral-300"
                          }`}
                        >
                          <Icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{label}</div>
                          <div className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate">{desc}</div>
                        </div>
                        {isActive && (
                          <ChevronRight size={14} className="text-primary-500 dark:text-primary-400" />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-neutral-200/50 dark:border-white/[0.06]">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-sm font-medium text-white ring-2 ring-white dark:ring-neutral-900 shadow-lg shadow-primary-500/20">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-neutral-925 shadow-lg shadow-emerald-500/50" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{user?.email || "Unknown"}</div>
                <div className="text-[10px] text-neutral-400 dark:text-neutral-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center gap-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:shadow-md dark:hover:shadow-primary-500/10"
                title={themeMode === "light" ? "Switch to dark mode" : "Switch to light mode"}
              >
                {themeMode === "light" ? <Moon size={16} className="text-neutral-600" /> : <Sun size={16} className="text-amber-400" />}
              </button>
              <button
                onClick={() => signOut()}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:shadow-md dark:hover:shadow-primary-500/10"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-64">
          {/* Top Header */}
          <header className="sticky top-0 z-30 border-b border-neutral-200/50 bg-white/80 dark:border-white/[0.06] dark:bg-neutral-950/80 backdrop-blur-xl">
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3 pt-12 md:pt-0">
                {currentPage && (
                  <>
                    <div className="p-2 rounded-lg bg-gradient-to-br from-primary-500/10 to-secondary-500/10 dark:from-primary-500/20 dark:to-secondary-500/20">
                      <currentPage.icon size={18} className="text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h1 className="font-semibold text-neutral-900 dark:text-neutral-50">{currentPage.label}</h1>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{currentPage.desc}</p>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3">
                {error ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-xs font-medium text-amber-600 dark:text-amber-400">{error}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">System OK</span>
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
