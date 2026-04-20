interface Props { active: string; onNavigate: (tab: string) => void; missionCount?: number; }

const tabs = [
  { key: 'missions', label: 'Missions', symbol: '[M]' },
  { key: 'carte',    label: 'Carte',    symbol: '[C]' },
  { key: 'alertes',  label: 'Alertes',  symbol: '[!]' },
  { key: 'equipe',   label: 'Equipe',   symbol: '[E]' },
];

export default function BottomNav({ active, onNavigate, missionCount }: Props) {
  return (
    <nav
      className="flex border-t shrink-0 pb-[env(safe-area-inset-bottom)]"
      style={{ background: '#0a1020', borderColor: 'rgba(255,255,255,0.06)' }}
    >
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => onNavigate(t.key)}
          className={`flex-1 py-3 flex flex-col items-center gap-1 transition-all relative active:scale-[0.97] ${
            active === t.key ? 'text-accent-400' : 'text-slate-500 hover:text-slate-400'
          }`}
        >
          <span
            className="text-[11px] font-mono leading-none tracking-wider transition-all"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            {t.symbol}
          </span>
          <span
            className="text-[9px] font-bold tracking-widest uppercase font-body"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            {t.label}
          </span>
          {active === t.key && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-accent-400" />
          )}
          {t.key === 'missions' && missionCount && missionCount > 0 && (
            <span className="absolute top-2 right-1/4 min-w-[17px] h-[17px] rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center shadow-lg shadow-red-600/30">
              {missionCount}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
}
