import { Alert } from '../data/mockData';

interface AlertCardProps {
  alert: Alert;
  onValidate: (id: string) => void;
  onReject: (id: string) => void;
  onCall: (tel: string) => void;
  onMerge?: (id: string) => void;
}

const incidentIcons: Record<string, string> = {
  'Incendie': '🔥', 'Accident de route': '🚗', 'Fuite de gaz': '💨', 'Secours à personne': '🏥',
  'Inondation': '🌊', 'Autre urgence': '⚡',
};

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'En attente' },
  VALIDATED: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Validée' },
  REJECTED: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Rejetée' },
  DUPLICATE: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'Doublon' },
};

function StarRating({ score }: { score: number }) {
  const full = Math.floor(score);
  const half = score % 1 >= 0.5;
  return (
    <span className="inline-flex items-center gap-0.5 text-xs">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < full ? 'text-amber-400' : (i === full && half ? 'text-amber-400/50' : 'text-gray-600')}>★</span>
      ))}
      <span className="text-gray-500 ml-1">({score.toFixed(1)})</span>
    </span>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "À l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  return `il y a ${h}h${min % 60 > 0 ? `${min % 60}min` : ''}`;
}

export default function AlertCard({ alert, onValidate, onReject, onCall, onMerge }: AlertCardProps) {
  const status = statusConfig[alert.statut];
  const icon = incidentIcons[alert.type_incident] || '⚠️';

  return (
    <div className={`card p-4 ${alert.statut === 'PENDING' ? 'border-amber-500/30 pulse-animation' : ''}`}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="text-2xl mt-0.5">{icon}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-white text-sm">{alert.type_incident}</span>
            <span className={`badge ${status.bg} ${status.text}`}>{status.label}</span>
            <span className="text-[10px] text-gray-500 font-mono">{alert.code}</span>
          </div>

          {/* Address */}
          <p className="text-xs text-gray-400 mb-1.5">📍 {alert.adresse}</p>

          {/* Description */}
          {alert.description && (
            <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-2 mb-2">
              <p className="text-xs text-gray-300">💬 {alert.description}</p>
            </div>
          )}

          {/* Citizen info */}
          <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
            <span>👤 {alert.citoyen_prenoms} {alert.citoyen_nom}</span>
            <a href={`tel:${alert.citoyen_telephone}`} className="text-blue-400 hover:text-blue-300">{alert.citoyen_telephone}</a>
            <StarRating score={alert.citoyen_reputation} />
          </div>

          {/* Duplicate warning */}
          {alert.similar_alert_nearby && (
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-2 mb-2 text-xs">
              <p className="text-orange-400 font-medium">⚠️ Alerte similaire détectée à {alert.similar_alert_distance} m</p>
              {alert.similar_intervention_id && (
                <p className="text-orange-300/70 mt-0.5">🚒 Équipe déjà en intervention à proximité</p>
              )}
            </div>
          )}

          {/* Actions */}
          {alert.statut === 'PENDING' && (
            <div className="flex items-center gap-2 mt-2">
              <button onClick={() => onCall(alert.citoyen_telephone)} className="btn-secondary py-1.5 px-3 text-xs">📞 Appeler</button>
              <button onClick={() => onValidate(alert.id)} className="btn-success py-1.5 px-3 text-xs">✅ Valider</button>
              {alert.similar_alert_nearby && onMerge && (
                <button onClick={() => onMerge(alert.id)} className="btn-warning py-1.5 px-3 text-xs">🔗 Fusionner</button>
              )}
              <button onClick={() => onReject(alert.id)} className="btn-danger py-1.5 px-3 text-xs">❌ Rejeter</button>
            </div>
          )}
        </div>

        {/* Time */}
        <div className="text-right shrink-0">
          <p className="text-[10px] text-gray-500">{timeAgo(alert.created_at)}</p>
          <p className="text-[10px] text-gray-600">{new Date(alert.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>
    </div>
  );
}
