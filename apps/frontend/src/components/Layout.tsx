import { NavLink, Outlet } from 'react-router-dom';
import { BarChart3, Globe2, Settings, Shield, Wand2 } from 'lucide-react';
import { useAuth } from '../lib/auth';

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/websites', label: 'Websites', icon: Globe2 },
  { to: '/research', label: 'Research', icon: Wand2 },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/admin', label: 'Admin', icon: Shield },
];

export function Layout() {
  const { profile, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="flex">
        <aside className="w-72 min-h-screen border-r bg-slate-50">
          <div className="p-6">
            <div className="text-lg font-semibold">Research • Build • Manage</div>
            <div className="text-xs text-slate-500 mt-1">Unified SEO & ops platform</div>
          </div>
          <nav className="px-3 pb-6">
            {nav
              .filter((x) => (x.to === '/admin' ? profile?.role === 'admin' : true))
              .map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-xl text-sm mb-1 transition ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-soft'
                        : 'text-slate-700 hover:bg-slate-200'
                    }`
                  }
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </NavLink>
              ))}
          </nav>
        </aside>

        <main className="flex-1">
          <header className="h-16 border-b flex items-center justify-between px-6 bg-white">
            <div className="text-sm text-slate-600">Pro mode: charts, tables, automation</div>
            <button
              onClick={() => signOut()}
              className="text-sm px-3 py-1.5 rounded-xl border hover:bg-slate-50"
            >
              Sign out
            </button>
          </header>
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
