import { Mission } from '../lib/data';

const incidentIcons: Record<string, string> = {
  'Incendie': '🔥', 'Accident de route': '🚗', 'Fuite de gaz': '💧',
  'Secours a personne': '🏥', 'Inondation': '🌊', 'Autre urgence': '⚡',
};

const statusBadge: Record<string, { bg: string; label: string }> = {
  NOUVEAU:   { bg: 'bg-cyan-900/50 text-cyan-300 border-cyan-700/50',       label: 'Nouveau' },
  EN_ROUTE:  { bg: 'bg-violet-900/50 text-violet-300 border-violet-700/50', label: 'En route' },
  SUR_PLACE: { bg: 'bg-amber-900/50 text-amber-300 border-amber-700/50',    label: 'Sur place' },
  TERMINE:   { bg: 'bg-slate-800/60 text-slate-500 border-slate-700/30',    label: 'Terminee' },
};

const prioriteBadge: Record<string, { bg: string }> = {
  HAUTE:   { bg: 'bg-red-900/50 text-red-300 border-red-700/50' },
  MOYENNE: { bg: 'bg-amber-900/40 text-amber-400 border-amber-700/40' },
  FAIBLE:  { bg: 'bg-slate-800/50 text-slate-500 border-slate-600/30' },
};

interface Props {
  mission: Mission;
  onViewDetails: (id: string) => void;
  onAccept?: (id: string) => void;
}

export default function MissionCard({ mission, onViewDetails, onAccept }: Props) {
  const icon = incidentIcons[mission.type_incident] || '⚠️';
  const st = statusBadge[mission.statut];
  const pr = prioriteBadge[mission.priorite];

  return (
    <div
      className="rounded-2xl p-5 mb-3 fade-in slide-up"
      style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #151f2e 100%)',
        border: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{icon}</span>
          <span
            className="font-bold text-white text-[15px] font-display"
            style={{ fontFamily: 'Sora, sans-serif' }}
          >
            {mission.type_incident}
          </span>
        </div>
        <span
          className="text-[10px] text-slate-600 font-mono"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
        >
          {mission.code}
        </span>
      </div>

      {/* Badges */}
      <div className="flex gap-1.5 mb-3 flex-wrap">
        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${st.bg}`}>{st.label}</span>
        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${pr.bg}`}>{mission.priorite}</span>
        {mission.source === 'CITOYEN' && (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold border bg-purple-900/40 text-purple-300 border-purple-700/40">Citoyen</span>
        )}
      </div>

      {/* Info */}
      <div className="space-y-1.5 mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="text-accent-600/70 text-xs">&#x25B6;</span>
          <span className="font-body" style={{ fontFamily: 'Manrope, sans-serif' }}>{mission.adresse}</span>
        </div>
        {mission.distance_km > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 font-body" style={{ fontFamily: 'Manrope, sans-serif' }}>Distance</span>
            <span className="font-bold text-slate-200 font-mono" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{mission.distance_km} km</span>
          </div>
        )}
        {mission.eta_minutes > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 font-body" style={{ fontFamily: 'Manrope, sans-serif' }}>ETA</span>
            <span className="font-bold text-slate-200 font-mono" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{mission.eta_minutes} min</span>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => onViewDetails(mission.id)}
          className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.97] text-slate-200 font-body hover:text-white"
          style={{
            background: 'rgba(8,145,178,0.08)',
            border: '1px solid rgba(8,145,178,0.2)',
            fontFamily: 'Manrope, sans-serif',
          }}
        >
          Details &rarr;
        </button>
        {mission.statut === 'NOUVEAU' && mission.equipe_assignee && onAccept && (
          <button
            onClick={() => onAccept(mission.id)}
            className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.97] text-white font-body shadow-lg shadow-emerald-900/20"
            style={{ background: 'linear-gradient(180deg, #059669 0%, #047857 100%)', fontFamily: 'Manrope, sans-serif' }}
          >
            Accepter
          </button>
        )}
      </div>
    </div>
  );
}
