import { storage } from '../lib/storage';

const statusBadge: Record<string, { bg: string; color: string; label: string }> = {
  PENDING:   { bg: 'rgba(180,83,9,0.10)',   color: '#b45309', label: 'En attente' },
  VALIDATED: { bg: 'rgba(8,145,178,0.10)',  color: '#0891b2', label: 'Validee' },
  REJECTED:  { bg: 'rgba(220,38,38,0.10)',  color: '#dc2626', label: 'Rejetee' },
  DUPLICATE: { bg: 'rgba(120,113,108,0.10)', color: '#78716c', label: 'Doublon' },
};

export default function History() {
  const history = storage.getHistory();

  return (
    <div className="flex-1 p-5 fade-in">
      <h2 className="text-xl font-extrabold mb-0.5 mt-2 font-display text-stone-900">
        Historique
      </h2>
      <p className="text-xs mb-6 font-body text-stone-400">
        Vos alertes precedentes
      </p>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(180,83,9,0.07)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c4b49a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <p className="text-sm font-body" style={{ color: '#c4b49a' }}>
            Aucune alerte enregistree
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {history.map((a, i) => {
            const s = statusBadge[a.statut] || statusBadge.PENDING;
            return (
              <div
                key={i}
                className="rounded-2xl p-4 fade-in bg-white"
                style={{
                  border: '1px solid #e7e5e4',
                  boxShadow: '0 2px 8px rgba(180,83,9,0.05)',
                  animationDelay: `${i * 50}ms`,
                }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm font-display text-stone-900">
                    {a.type_incident}
                  </span>
                  <span
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold font-body"
                    style={{ background: s.bg, color: s.color }}
                  >
                    {s.label}
                  </span>
                </div>
                <p className="text-xs mb-1.5 flex items-center gap-1 font-body text-stone-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {a.adresse?.substring(0, 50)}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono" style={{ color: '#b45309', letterSpacing: '0.04em' }}>
                    {a.code}
                  </span>
                  <span className="text-[10px] font-body" style={{ color: '#c4b49a' }}>
                    {new Date(a.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
