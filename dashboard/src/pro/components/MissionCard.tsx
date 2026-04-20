import { Mission } from '../lib/data';

const incidentIcons: Record<string, string> = {
  'Incendie': '🔥', 'Accident de route': '🚗', 'Fuite de gaz': '💧',
  'Secours a personne': '🏥', 'Inondation': '🌊', 'Autre urgence': '⚡',
};

const statusBadge: Record<string, { bg: string; label: string }> = {
  NOUVEAU: { bg: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Nouveau' },
  EN_ROUTE: { bg: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'En route' },
  SUR_PLACE: { bg: 'bg-orange-100 text-orange-700 border-orange-200', label: 'Sur place' },
  TERMINE: { bg: 'bg-gray-100 text-gray-500 border-gray-200', label: 'Terminee' },
};

const prioriteBadge: Record<string, { bg: string }> = {
  HAUTE: { bg: 'bg-red-100 text-red-600 border-red-200' },
  MOYENNE: { bg: 'bg-amber-100 text-amber-600 border-amber-200' },
  FAIBLE: { bg: 'bg-blue-100 text-blue-600 border-blue-200' },
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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-3 fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <span className="font-bold text-gray-900 text-[15px]">{mission.type_incident}</span>
        </div>
        <span className="text-xs font-mono text-gray-400">{mission.code}</span>
      </div>

      {/* Badges */}
      <div className="flex gap-1.5 mb-3 flex-wrap">
        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${st.bg}`}>{st.label}</span>
        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${pr.bg}`}>{mission.priorite}</span>
        {mission.source === 'CITOYEN' && (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold border bg-purple-100 text-purple-600 border-purple-200">Citoyen</span>
        )}
      </div>

      {/* Info */}
      <div className="space-y-1.5 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="text-pink-500">📍</span>
          <span>{mission.adresse}</span>
        </div>
        {mission.distance_km > 0 && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-500">
              <span>🧭</span><span>Distance</span>
            </div>
            <span className="font-bold text-gray-900">{mission.distance_km} km</span>
          </div>
        )}
        {mission.eta_minutes > 0 && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-500">
              <span>⏱️</span><span>ETA</span>
            </div>
            <span className="font-bold text-gray-900">{mission.eta_minutes} min</span>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <button onClick={() => onViewDetails(mission.id)}
          className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold text-sm transition-all active:scale-[0.98]">
          Voir details →
        </button>
        {mission.statut === 'NOUVEAU' && mission.equipe_assignee && onAccept && (
          <button onClick={() => onAccept(mission.id)}
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-all active:scale-[0.98]">
            Accepter
          </button>
        )}
      </div>
    </div>
  );
}
