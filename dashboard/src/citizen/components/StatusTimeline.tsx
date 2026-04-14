interface Props { currentStep: number; timestamps?: (string | null)[]; }

const steps = [
  { label: 'Alerte recue', icon: '✓' },
  { label: 'Validation en cours...', icon: '⏱' },
  { label: 'Equipe mobilisee', icon: '✅' },
  { label: 'Intervention en cours', icon: '🚒' },
  { label: 'Intervention terminee', icon: '✔️' },
];

export default function StatusTimeline({ currentStep, timestamps }: Props) {
  return (
    <div className="space-y-0">
      {steps.map((step, i) => {
        const done = i < currentStep;
        const active = i === currentStep;
        const future = i > currentStep;
        return (
          <div key={i} className="flex items-start gap-3 fade-in" style={{ animationDelay: `${i * 80}ms` }}>
            {/* Line + Dot */}
            <div className="flex flex-col items-center w-8 shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                done ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' :
                active ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 pulse-dot' :
                'bg-gray-100 text-gray-400'
              }`}>
                {done ? '✓' : active ? step.icon : (i + 1)}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-0.5 h-8 ${done ? 'bg-emerald-400' : 'bg-gray-200'} transition-colors`} />
              )}
            </div>
            {/* Label */}
            <div className="pt-1">
              <p className={`text-[13px] font-semibold ${done ? 'text-emerald-600' : active ? 'text-gray-900' : 'text-gray-400'}`}>
                {step.label}
              </p>
              {timestamps?.[i] && (
                <p className="text-[11px] text-gray-400">{new Date(timestamps[i]!).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
