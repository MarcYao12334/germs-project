interface Props { active: string; onNavigate: (tab: string) => void; alertCount?: number; }

const tabs = [
  { key: 'home', label: 'Accueil', icon: '🏠' },
  { key: 'tracking', label: 'Suivi', icon: '📡' },
  { key: 'history', label: 'Historique', icon: '📜' },
  { key: 'profile', label: 'Profil', icon: '👤' },
];

export default function BottomNav({ active, onNavigate, alertCount }: Props) {
  return (
    <nav className="flex border-t border-gray-100 bg-white shrink-0 pb-[env(safe-area-inset-bottom)]">
      {tabs.map(t => (
        <button key={t.key} onClick={() => onNavigate(t.key)}
          className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 transition-colors relative ${
            active === t.key ? 'text-red-600' : 'text-gray-400'
          }`}>
          <span className="text-xl">{t.icon}</span>
          <span className="text-[10px] font-semibold">{t.label}</span>
          {t.key === 'tracking' && alertCount && alertCount > 0 && (
            <span className="absolute top-1 right-1/4 w-2 h-2 rounded-full bg-red-500 pulse-dot" />
          )}
        </button>
      ))}
    </nav>
  );
}
