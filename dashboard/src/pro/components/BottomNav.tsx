interface Props { active: string; onNavigate: (tab: string) => void; missionCount?: number; }

const tabs = [
  { key: 'missions', label: 'Missions', icon: '📊' },
  { key: 'carte', label: 'Carte', icon: '🗺️' },
  { key: 'alertes', label: 'Alertes', icon: '🔔' },
  { key: 'equipe', label: 'Equipe', icon: '👥' },
];

export default function BottomNav({ active, onNavigate, missionCount }: Props) {
  return (
    <nav className="flex border-t border-gray-100 bg-white shrink-0 pb-[env(safe-area-inset-bottom)]">
      {tabs.map(t => (
        <button key={t.key} onClick={() => onNavigate(t.key)}
          className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 transition-colors relative ${
            active === t.key ? 'text-blue-700' : 'text-gray-400'
          }`}>
          <span className="text-xl">{t.icon}</span>
          <span className="text-[10px] font-semibold">{t.label}</span>
          {t.key === 'missions' && missionCount && missionCount > 0 && (
            <span className="absolute top-1 right-1/4 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{missionCount}</span>
          )}
        </button>
      ))}
    </nav>
  );
}
