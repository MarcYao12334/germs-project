import { Mission } from '../lib/data';

interface Props { missions: Mission[]; onViewDetails: (id: string) => void; }

export default function AlertsList({ missions, onViewDetails }: Props) {
  const newMissions = missions.filter(m => m.statut === 'NOUVEAU');

  return (
    <div className="flex-1 overflow-y-auto p-5 fade-in">
      <h2 className="text-lg font-extrabold text-gray-900 mb-1">Alertes & Nouvelles missions</h2>
      <p className="text-xs text-gray-500 mb-4">{newMissions.length} nouvelle(s) mission(s)</p>

      {newMissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-4xl mb-3">🔔</p>
          <p className="text-sm text-gray-400">Aucune nouvelle alerte</p>
        </div>
      ) : (
        newMissions.map(m => (
          <div key={m.id} onClick={() => onViewDetails(m.id)}
            className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-3 cursor-pointer active:scale-[0.98] transition-all">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-sm text-gray-900">{m.type_incident}</span>
              <span className="text-xs font-mono text-gray-400">{m.code}</span>
            </div>
            <p className="text-xs text-gray-500 mb-1">📍 {m.adresse}</p>
            <div className="flex gap-3 text-xs text-gray-600">
              <span>🧭 {m.distance_km} km</span>
              <span>⏱️ {m.eta_minutes} min</span>
              {m.source === 'CITOYEN' && <span className="text-purple-600 font-semibold">Citoyen</span>}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
