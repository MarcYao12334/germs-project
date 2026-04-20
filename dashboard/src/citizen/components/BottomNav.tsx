interface Props { active: string; onNavigate: (tab: string) => void; alertCount?: number; }

const tabs = [
  { key: 'home',     label: 'Accueil',    icon: '⌂' },
  { key: 'tracking', label: 'Suivi',      icon: '◎' },
  { key: 'history',  label: 'Historique', icon: '≡' },
  { key: 'profile',  label: 'Profil',     icon: '○' },
];

export default function BottomNav({ active, onNavigate, alertCount }: Props) {
  return (
    <nav
      className="flex shrink-0 pb-[env(safe-area-inset-bottom)]"
      style={{
        background: 'linear-gradient(0deg, #FFFBF5 0%, #FEF7ED 100%)',
        borderTop: '1px solid rgba(180,83,9,0.10)',
        boxShadow: '0 -2px 16px rgba(180,83,9,0.06)',
      }}
    >
      {tabs.map(t => {
        const isActive = active === t.key;
        return (
          <button
            key={t.key}
            onClick={() => onNavigate(t.key)}
            className="flex-1 py-2.5 flex flex-col items-center gap-1 transition-all relative"
            style={{ color: isActive ? '#b45309' : '#a8a29e' }}
          >
            {/* Active indicator bar on top */}
            {isActive && (
              <span
                className="absolute top-0 left-1/2 -translate-x-1/2"
                style={{ width: 28, height: 3, background: '#b45309', borderRadius: '0 0 4px 4px' }}
              />
            )}
            <span
              className={`transition-all leading-none ${isActive ? 'scale-110' : 'scale-100'}`}
              style={{ fontSize: 20, fontFamily: 'monospace' }}
            >
              {t.icon}
            </span>
            <span
              className="text-[10px] tracking-wide font-body"
              style={{
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#b45309' : '#a8a29e',
              }}
            >
              {t.label}
            </span>
            {t.key === 'tracking' && alertCount && alertCount > 0 && (
              <span className="absolute top-1.5 right-[calc(50%-18px)] w-2 h-2 rounded-full bg-amber-500 pulse-dot" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
