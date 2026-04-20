import { Mission } from '../lib/data';

interface Props { missions: Mission[]; onViewDetails: (id: string) => void; }

export default function AlertsList({ missions, onViewDetails }: Props) {
  const newMissions = missions.filter(m => m.statut === 'NOUVEAU');

  return (
    <div className="flex-1 overflow-y-auto p-5 fade-in">
      <h2
        className="text-lg font-extrabold text-white mb-1 font-display"
        style={{ fontFamily: 'Sora, sans-serif' }}
      >
        Alertes &amp; Nouvelles missions
      </h2>
      <p
        className="text-xs text-slate-500 mb-5 font-body"
        style={{ fontFamily: 'Manrope, sans-serif' }}
      >
        {newMissions.length} nouvelle(s) mission(s)
      </p>

      {newMissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <span
              className="text-slate-600 text-xl font-mono"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              [!]
            </span>
          </div>
          <p
            className="text-sm text-slate-500 font-body"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            Aucune nouvelle alerte
          </p>
        </div>
      ) : (
        newMissions.map(m => (
          <div
            key={m.id}
            onClick={() => onViewDetails(m.id)}
            className="rounded-2xl p-4 mb-3 cursor-pointer active:scale-[0.97] transition-all hover:brightness-110"
            style={{
              background: 'linear-gradient(135deg, rgba(180,83,9,0.09) 0%, rgba(146,64,14,0.06) 100%)',
              border: '1px solid rgba(180,83,9,0.22)',
            }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span
                className="font-bold text-sm text-white font-display"
                style={{ fontFamily: 'Sora, sans-serif' }}
              >
                {m.type_incident}
              </span>
              <span
                className="text-[10px] text-slate-600 font-mono"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                {m.code}
              </span>
            </div>
            <p
              className="text-xs text-slate-400 mb-2 font-body"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              <span className="mr-1" style={{ color: 'rgba(180,83,9,0.7)' }}>&#x25B6;</span> {m.adresse}
            </p>
            <div className="flex gap-4 text-xs text-slate-600">
              <span
                className="font-mono"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                {m.distance_km} km
              </span>
              <span
                className="font-mono"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                {m.eta_minutes} min
              </span>
              {m.source === 'CITOYEN' && (
                <span
                  className="text-purple-400 font-semibold font-body"
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                >
                  Citoyen
                </span>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
