import { storage } from '../lib/storage';

const statusBadge: Record<string, { bg: string; label: string }> = {
  PENDING: { bg: 'bg-amber-100 text-amber-700', label: 'En attente' },
  VALIDATED: { bg: 'bg-emerald-100 text-emerald-700', label: 'Validee' },
  REJECTED: { bg: 'bg-red-100 text-red-700', label: 'Rejetee' },
  DUPLICATE: { bg: 'bg-gray-100 text-gray-700', label: 'Doublon' },
};

export default function History() {
  const history = storage.getHistory();

  return (
    <div className="flex-1 p-5 fade-in">
      <h2 className="text-xl font-extrabold text-gray-900 mb-1 mt-2">Historique</h2>
      <p className="text-xs text-gray-500 mb-5">Vos alertes precedentes</p>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-4xl mb-3">📜</p>
          <p className="text-sm text-gray-400">Aucune alerte enregistree</p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((a, i) => {
            const s = statusBadge[a.statut] || statusBadge.PENDING;
            return (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-gray-900">{a.type_incident}</span>
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${s.bg}`}>{s.label}</span>
                </div>
                <p className="text-xs text-gray-500 mb-0.5">📍 {a.adresse?.substring(0, 50)}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-mono">{a.code}</span>
                  <span className="text-[10px] text-gray-400">{new Date(a.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
