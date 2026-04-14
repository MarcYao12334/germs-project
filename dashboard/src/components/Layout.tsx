import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

interface LayoutProps {
  user: any;
  onLogout: () => void;
}

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/alerts', label: 'Alertes', icon: '🔔', badge: 4 },
  { to: '/interventions', label: 'Interventions', icon: '🚒' },
  { to: '/map', label: 'Carte', icon: '🗺️' },
  { to: '/teams', label: 'Équipes', icon: '👥' },
  { to: '/history', label: 'Historique', icon: '📜' },
  { to: '/settings', label: 'Configuration', icon: '⚙️' },
];

export default function Layout({ user, onLogout }: LayoutProps) {
  const location = useLocation();
  const [time, setTime] = useState(new Date());
  const [wsStatus, setWsStatus] = useState<'connected' | 'disconnected'>('connected');

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-800/80 backdrop-blur border-r border-gray-700/50 flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-700/50">
          <h1 className="text-lg font-bold text-red-500 flex items-center gap-2">🚒 GERMS</h1>
          <p className="text-[10px] text-gray-500 mt-0.5">Centre de Commandement</p>
        </div>

        <nav className="flex-1 p-2 overflow-y-auto">
          {navItems.map(({ to, label, icon, badge }) => {
            const active = location.pathname === to;
            return (
              <Link key={to} to={to}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5 text-sm transition-all ${
                  active ? 'bg-red-600/20 text-red-400 font-medium' : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                }`}>
                <span className="text-base">{icon}</span>
                <span className="flex-1">{label}</span>
                {badge && <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold pulse-animation">{badge}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="p-3 border-t border-gray-700/50">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-red-600/20 flex items-center justify-center text-sm">👤</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-200 truncate">{user?.prenoms} {user?.nom}</p>
              <p className="text-[10px] text-gray-500">{user?.role}</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full text-xs text-gray-500 hover:text-red-400 transition-colors text-left">Déconnexion</button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-12 bg-gray-800/50 backdrop-blur border-b border-gray-700/30 flex items-center px-4 shrink-0">
          <div className="flex-1" />
          <div className="flex items-center gap-4 text-xs">
            <span className="text-gray-500">🇫🇷 France — {time.toLocaleTimeString('fr-FR')}</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${wsStatus === 'connected' ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span className="text-gray-500">{wsStatus === 'connected' ? 'En ligne' : 'Hors ligne'}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
