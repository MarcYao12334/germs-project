interface Props { currentStep: number; timestamps?: (string | null)[]; }

const steps = [
  { label: 'Alerte recue', icon: '✓' },
  { label: 'Validation en cours...', icon: '◌' },
  { label: 'Equipe mobilisee', icon: '✓' },
  { label: 'Intervention en cours', icon: '▶' },
  { label: 'Intervention terminee', icon: '✓' },
];

export default function StatusTimeline({ currentStep, timestamps }: Props) {
  return (
    <div className="space-y-0">
      {steps.map((step, i) => {
        const done = i < currentStep;
        const active = i === currentStep;
        return (
          <div key={i} className="flex items-start gap-4 fade-in" style={{ animationDelay: `${i * 80}ms` }}>
            {/* Line + Dot */}
            <div className="flex flex-col items-center w-8 shrink-0">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                style={
                  done
                    ? { background: '#0891b2', color: '#fff', boxShadow: '0 4px 12px rgba(8,145,178,0.25)' }
                    : active
                    ? { background: '#b45309', color: '#fff', boxShadow: '0 4px 16px rgba(180,83,9,0.30)' }
                    : { background: '#e7e5e4', color: '#a8a29e', border: '1.5px solid #d6d3d1' }
                }
              >
                {done ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : active ? (
                  <span className="text-xs font-bold">{i + 1}</span>
                ) : (
                  <span className="text-xs">{i + 1}</span>
                )}
              </div>
              {i < steps.length - 1 && (
                <div
                  className="w-0.5 h-8 transition-colors"
                  style={{ background: done ? '#06b6d4' : '#e7e5e4' }}
                />
              )}
            </div>
            {/* Label */}
            <div className="pt-1.5 pb-3">
              <p
                className="text-[13px] font-semibold font-body"
                style={{
                  color: done ? '#0891b2' : active ? '#1c1917' : '#a8a29e',
                }}
              >
                {step.label}
              </p>
              {active && (
                <p className="text-[10px] mt-0.5 font-body" style={{ color: '#b45309', fontWeight: 600 }}>
                  En cours...
                </p>
              )}
              {timestamps?.[i] && (
                <p className="text-[11px] mt-0.5 font-mono" style={{ color: '#a8a29e' }}>
                  {new Date(timestamps[i]!).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
