import { ActiveAlert } from '../types';
import { storage } from '../lib/storage';

const incidents = [
  {
    type: 'Incendie',
    symbol: '▲',
    gradient: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)',
    shadow: 'rgba(180,83,9,0.28)',
    accent: '#fef3c7',
    accentBorder: 'rgba(180,83,9,0.18)',
  },
  {
    type: 'Accident de route',
    symbol: '◈',
    gradient: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
    shadow: 'rgba(8,145,178,0.28)',
    accent: '#ecfeff',
    accentBorder: 'rgba(8,145,178,0.18)',
  },
  {
    type: 'Secours a personne',
    symbol: '+',
    gradient: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
    shadow: 'rgba(5,150,105,0.28)',
    accent: '#f0fdf4',
    accentBorder: 'rgba(5,150,105,0.18)',
  },
  {
    type: 'Fuite de gaz',
    symbol: '◎',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
    shadow: 'rgba(124,58,237,0.28)',
    accent: '#f5f3ff',
    accentBorder: 'rgba(124,58,237,0.18)',
  },
  {
    type: 'Inondation',
    symbol: '≋',
    gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    shadow: 'rgba(2,132,199,0.28)',
    accent: '#eff6ff',
    accentBorder: 'rgba(2,132,199,0.18)',
  },
  {
    type: 'Autre urgence',
    symbol: '!',
    gradient: 'linear-gradient(135deg, #b45309 0%, #92400e 100%)',
    shadow: 'rgba(146,64,14,0.28)',
    accent: '#fefce8',
    accentBorder: 'rgba(146,64,14,0.18)',
  },
];

interface Props { activeAlert: ActiveAlert | null; onSelectType: (type: string) => void; onGoToTracking: () => void; }

export default function Home({ activeAlert, onSelectType, onGoToTracking }: Props) {
  const profile = storage.getProfile();
  const isBlacklisted = profile && profile.reputation <= 0;

  return (
    <div className="p-5 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-7 mt-3">
        <div>
          <h1 className="text-xl font-extrabold font-display text-stone-900">
            Signaler une urgence
          </h1>
          <p className="text-xs mt-0.5 font-body text-stone-400">
            GERMS Alert — {profile?.prenoms} {profile?.nom}
          </p>
        </div>
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sahel"
          style={{ background: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        </div>
      </div>

      {/* Active alert banner */}
      {activeAlert && activeAlert.currentStep >= 0 && activeAlert.currentStep < 5 && (
        <button
          onClick={onGoToTracking}
          className="w-full rounded-2xl p-4 mb-6 flex items-center gap-3 transition-all active:scale-[0.97]"
          style={{
            background: 'linear-gradient(135deg, #fef9f0 0%, #fef3c7 100%)',
            border: '1.5px solid rgba(180,83,9,0.22)',
            boxShadow: '0 2px 14px rgba(180,83,9,0.10)',
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center pulse-dot shrink-0"
            style={{ background: '#b45309' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="2" />
              <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
            </svg>
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-sm font-display text-amber-900">Alerte en cours</p>
            <p className="text-xs font-body" style={{ color: '#b45309' }}>{activeAlert.alert.type_incident} — Voir le suivi →</p>
          </div>
        </button>
      )}

      {/* Blacklisted */}
      {isBlacklisted ? (
        <div
          className="rounded-2xl p-6 text-center"
          style={{
            background: 'linear-gradient(135deg, #fef2f2 0%, #fde8e8 100%)',
            border: '1.5px solid rgba(220,38,38,0.18)',
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
            style={{ background: '#fee2e2' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          </div>
          <p className="font-bold mb-1 font-display" style={{ color: '#b91c1c' }}>Compte temporairement desactive</p>
          <p className="text-sm font-body" style={{ color: '#ef4444' }}>Votre score de reputation est a 0. Vous pourrez renvoyer des alertes dans 30 jours.</p>
        </div>
      ) : (
        <>
          <p className="text-sm font-semibold mb-4 font-body text-stone-500">
            Quel type d'urgence ?
          </p>
          <div className="grid grid-cols-2 gap-3">
            {incidents.map((inc, idx) => (
              <button
                key={inc.type}
                onClick={() => onSelectType(inc.type)}
                className="rounded-2xl p-5 text-left transition-all active:scale-[0.97] slide-up"
                style={{
                  background: 'rgba(255,255,255,0.70)',
                  border: `1.5px solid ${inc.accentBorder}`,
                  boxShadow: `0 2px 14px ${inc.shadow}`,
                  animationDelay: `${idx * 60}ms`,
                  backdropFilter: 'blur(4px)',
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 text-white font-bold text-xl"
                  style={{
                    background: inc.gradient,
                    boxShadow: `0 4px 12px ${inc.shadow}`,
                  }}
                >
                  {inc.symbol}
                </div>
                <p className="font-bold text-[13px] leading-snug font-body text-stone-900">
                  {inc.type}
                </p>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
