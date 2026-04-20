import { ActiveAlert } from '../types';
import { storage } from '../lib/storage';

const incidents = [
  { type: 'Incendie', icon: '🔥', color: 'from-red-500 to-orange-500', shadow: 'shadow-red-500/20' },
  { type: 'Accident de route', icon: '🚗', color: 'from-blue-500 to-indigo-500', shadow: 'shadow-blue-500/20' },
  { type: 'Secours à personne', icon: '🏥', color: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/20' },
  { type: 'Fuite de gaz', icon: '💧', color: 'from-purple-500 to-violet-500', shadow: 'shadow-purple-500/20' },
  { type: 'Inondation', icon: '🌊', color: 'from-cyan-500 to-blue-500', shadow: 'shadow-cyan-500/20' },
  { type: 'Autre urgence', icon: '⚡', color: 'from-amber-500 to-yellow-500', shadow: 'shadow-amber-500/20' },
];

interface Props { activeAlert: ActiveAlert | null; onSelectType: (type: string) => void; onGoToTracking: () => void; }

export default function Home({ activeAlert, onSelectType, onGoToTracking }: Props) {
  const profile = storage.getProfile();
  const isBlacklisted = profile && profile.reputation <= 0;

  return (
    <div className="p-5 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 mt-2">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Signaler une urgence</h1>
          <p className="text-xs text-gray-500 mt-0.5">GERMS Alert — {profile?.prenoms} {profile?.nom}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-xl shadow-lg shadow-red-500/20">🚒</div>
      </div>

      {/* Active alert banner */}
      {activeAlert && activeAlert.currentStep >= 0 && activeAlert.currentStep < 5 && (
        <button onClick={onGoToTracking} className="w-full bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-4 mb-5 flex items-center gap-3 transition-all active:scale-[0.98]">
          <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center text-xl pulse-dot">📡</div>
          <div className="flex-1 text-left">
            <p className="font-bold text-red-700 text-sm">Alerte en cours</p>
            <p className="text-xs text-red-500">{activeAlert.alert.type_incident} — Voir le suivi →</p>
          </div>
        </button>
      )}

      {/* Blacklisted */}
      {isBlacklisted ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-3xl mb-3">🚫</p>
          <p className="font-bold text-red-700 mb-1">Compte temporairement desactive</p>
          <p className="text-sm text-red-500">Votre score de reputation est a 0. Vous pourrez renvoyer des alertes dans 30 jours.</p>
        </div>
      ) : (
        <>
          <p className="text-sm font-semibold text-gray-600 mb-3">Quel type d'urgence ?</p>
          <div className="grid grid-cols-2 gap-3">
            {incidents.map(inc => (
              <button key={inc.type} onClick={() => onSelectType(inc.type)}
                className={`bg-gradient-to-br ${inc.color} rounded-2xl p-5 text-center shadow-lg ${inc.shadow} transition-all active:scale-95 hover:scale-[1.02]`}>
                <div className="text-4xl mb-2">{inc.icon}</div>
                <p className="text-white font-bold text-[13px] leading-tight">{inc.type}</p>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
