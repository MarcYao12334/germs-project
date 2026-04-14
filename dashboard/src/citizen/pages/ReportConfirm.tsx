import { ActiveAlert } from '../types';

export default function ReportConfirm({ alert, onGoToTracking }: { alert: ActiveAlert; onGoToTracking: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 fade-in">
      <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center text-5xl mb-6 slide-up">
        ✅
      </div>
      <h2 className="text-xl font-extrabold text-gray-900 mb-2">Alerte transmise !</h2>
      <p className="text-sm text-gray-500 text-center mb-2">Votre alerte a ete transmise aux secours.</p>

      <div className="bg-gray-50 rounded-2xl px-6 py-4 mb-6 text-center">
        <p className="text-xs text-gray-400 mb-1">Numero de dossier</p>
        <p className="text-lg font-mono font-extrabold text-gray-900">{alert.alert.code}</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 mb-8 text-center">
        <p className="text-xs text-blue-600">Vous serez notifie des que l'equipe sera mobilisee</p>
      </div>

      <button onClick={onGoToTracking} className="btn-primary">📡 Suivre mon alerte</button>
    </div>
  );
}
