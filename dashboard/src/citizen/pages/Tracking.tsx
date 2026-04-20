import { ActiveAlert } from '../types';
import StatusTimeline from '../components/StatusTimeline';
import TeamCard from '../components/TeamCard';

export default function Tracking({ activeAlert }: { activeAlert: ActiveAlert | null }) {
  if (!activeAlert) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center fade-in">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'rgba(180,83,9,0.08)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="2" />
            <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
          </svg>
        </div>
        <p className="text-lg font-bold mb-1 font-display text-stone-900">
          Aucune alerte active
        </p>
        <p className="text-sm font-body text-stone-400">
          Signalez une urgence depuis l'accueil pour suivre son traitement ici.
        </p>
      </div>
    );
  }

  const isRejected = activeAlert.currentStep === -1;

  return (
    <div className="flex-1 p-5 fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 mt-2">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sahel"
          style={{ background: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="2" />
            <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold font-display text-stone-900">
            Suivi en temps reel
          </h2>
          <p className="text-xs font-mono text-stone-400" style={{ letterSpacing: '0.05em' }}>
            {activeAlert.alert.code}
          </p>
        </div>
      </div>

      {/* Alert info */}
      <div
        className="rounded-2xl p-3.5 mb-5 flex items-center gap-3"
        style={{
          background: 'linear-gradient(135deg, #fef9f0 0%, #fef3c7 100%)',
          border: '1.5px solid rgba(180,83,9,0.14)',
        }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-white text-sm"
          style={{ background: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)' }}
        >
          ▲
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm font-display text-stone-900">
            {activeAlert.alert.type_incident}
          </p>
          <p className="text-[11px] truncate font-body text-stone-400">
            {activeAlert.alert.adresse?.substring(0, 60)}
          </p>
        </div>
      </div>

      {/* Rejected */}
      {isRejected && (
        <div
          className="rounded-2xl p-5 text-center mb-5 slide-up"
          style={{
            background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
            border: '1.5px solid rgba(220,38,38,0.18)',
          }}
        >
          <div
            className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
            style={{ background: '#fee2e2' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <p className="font-bold mb-1 font-display" style={{ color: '#b91c1c' }}>Alerte rejetee</p>
          <p className="text-sm font-body" style={{ color: '#ef4444' }}>
            Les secours ont determine que cette alerte ne necessite pas d'intervention.
          </p>
          <p className="text-xs mt-2 font-body text-stone-400">
            Votre score de reputation a ete ajuste.
          </p>
        </div>
      )}

      {/* Timeline */}
      {!isRejected && (
        <>
          <p className="text-sm font-semibold mb-3 font-body text-stone-600">
            Statut
          </p>
          <div
            className="rounded-2xl p-4 mb-5"
            style={{
              background: 'rgba(255,255,255,0.65)',
              border: '1px solid #e7e5e4',
              boxShadow: '0 2px 10px rgba(180,83,9,0.05)',
            }}
          >
            <StatusTimeline currentStep={activeAlert.currentStep} />
          </div>

          {/* Team card */}
          {activeAlert.team && (
            <div className="mb-4">
              <p className="text-sm font-semibold mb-2 font-body text-stone-600">
                Equipe mobilisee
              </p>
              <TeamCard team={activeAlert.team} />
            </div>
          )}

          {/* Waiting message */}
          {activeAlert.currentStep <= 1 && (
            <div
              className="rounded-2xl p-4 text-center"
              style={{
                background: 'linear-gradient(135deg, #fef9f0 0%, #fef3c7 100%)',
                border: '1.5px solid rgba(180,83,9,0.16)',
              }}
            >
              <p className="text-sm font-medium font-body" style={{ color: '#92400e' }}>
                Votre alerte est en cours de traitement par le centre de commandement...
              </p>
            </div>
          )}

          {activeAlert.currentStep === 4 && (
            <div
              className="rounded-2xl p-4 text-center slide-up"
              style={{
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                border: '1.5px solid rgba(8,145,178,0.18)',
              }}
            >
              <div
                className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center"
                style={{ background: 'rgba(8,145,178,0.10)' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0891b2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-sm font-semibold font-body" style={{ color: '#0891b2' }}>
                Intervention terminee avec succes !
              </p>
              <p className="text-xs mt-1 font-body" style={{ color: '#67e8f9' }}>
                Merci pour votre signalement. Un ecran de notation va apparaitre.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
