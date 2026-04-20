import { ActiveAlert } from '../types';
import StatusTimeline from '../components/StatusTimeline';
import TeamCard from '../components/TeamCard';

export default function Tracking({ activeAlert }: { activeAlert: ActiveAlert | null }) {
  if (!activeAlert) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center fade-in">
        <p className="text-4xl mb-3">📡</p>
        <p className="text-lg font-bold text-gray-900 mb-1">Aucune alerte active</p>
        <p className="text-sm text-gray-500">Signalez une urgence depuis l'accueil pour suivre son traitement ici.</p>
      </div>
    );
  }

  const isRejected = activeAlert.currentStep === -1;

  return (
    <div className="flex-1 p-5 fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 mt-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-xl">📡</div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Suivi en temps reel</h2>
          <p className="text-xs text-gray-500 font-mono">{activeAlert.alert.code}</p>
        </div>
      </div>

      {/* Alert info */}
      <div className="bg-gray-50 rounded-2xl p-3 mb-5 flex items-center gap-3">
        <span className="text-2xl">{activeAlert.alert.type_incident === 'Incendie' ? '🔥' : activeAlert.alert.type_incident === 'Accident de route' ? '🚗' : '⚠️'}</span>
        <div className="flex-1">
          <p className="font-bold text-sm text-gray-900">{activeAlert.alert.type_incident}</p>
          <p className="text-[11px] text-gray-500">{activeAlert.alert.adresse?.substring(0, 60)}</p>
        </div>
      </div>

      {/* Rejected */}
      {isRejected && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center mb-5 slide-up">
          <p className="text-3xl mb-2">❌</p>
          <p className="font-bold text-red-700 mb-1">Alerte rejetee</p>
          <p className="text-sm text-red-500">Les secours ont determine que cette alerte ne necessite pas d'intervention.</p>
          <p className="text-xs text-gray-400 mt-2">Votre score de reputation a ete ajuste.</p>
        </div>
      )}

      {/* Timeline */}
      {!isRejected && (
        <>
          <p className="text-sm font-semibold text-gray-700 mb-3">Statut</p>
          <div className="mb-5">
            <StatusTimeline currentStep={activeAlert.currentStep} />
          </div>

          {/* Team card */}
          {activeAlert.team && (
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Equipe mobilisee</p>
              <TeamCard team={activeAlert.team} />
            </div>
          )}

          {/* Waiting message */}
          {activeAlert.currentStep <= 1 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
              <p className="text-sm text-amber-700 font-medium">⏳ Votre alerte est en cours de traitement par le centre de commandement...</p>
            </div>
          )}

          {activeAlert.currentStep === 4 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center slide-up">
              <p className="text-lg mb-1">✅</p>
              <p className="text-sm text-emerald-700 font-semibold">Intervention terminee avec succes !</p>
              <p className="text-xs text-emerald-500 mt-1">Merci pour votre signalement. Un ecran de notation va apparaitre.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
