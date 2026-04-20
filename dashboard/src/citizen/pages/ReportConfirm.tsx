import { ActiveAlert } from '../types';

export default function ReportConfirm({ alert, onGoToTracking }: { alert: ActiveAlert; onGoToTracking: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 fade-in">
      {/* Success icon */}
      <div
        className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6 slide-up"
        style={{
          background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
          border: '2px solid rgba(8,145,178,0.15)',
          boxShadow: '0 8px 32px rgba(8,145,178,0.14)',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#0891b2"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h2
        className="text-xl font-extrabold mb-2 slide-up text-center font-display text-stone-900"
        style={{ animationDelay: '60ms' }}
      >
        Alerte transmise !
      </h2>
      <p
        className="text-sm text-center mb-6 slide-up font-body text-stone-400"
        style={{ animationDelay: '100ms' }}
      >
        Votre alerte a ete transmise aux secours.
      </p>

      {/* Case number */}
      <div
        className="rounded-2xl px-8 py-5 mb-4 text-center slide-up w-full"
        style={{
          background: 'linear-gradient(135deg, #fef9f0 0%, #fef3c7 100%)',
          border: '1.5px solid rgba(180,83,9,0.16)',
          boxShadow: '0 2px 12px rgba(180,83,9,0.08)',
          animationDelay: '140ms',
        }}
      >
        <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5 font-body" style={{ color: '#b45309' }}>
          Numero de dossier
        </p>
        <p className="text-lg font-extrabold font-mono text-stone-900" style={{ letterSpacing: '0.08em' }}>
          {alert.alert.code}
        </p>
      </div>

      {/* Info note */}
      <div
        className="rounded-2xl px-4 py-3 mb-8 text-center slide-up w-full"
        style={{
          background: 'rgba(8,145,178,0.06)',
          border: '1px solid rgba(8,145,178,0.16)',
          animationDelay: '180ms',
        }}
      >
        <p className="text-xs font-body font-medium" style={{ color: '#0891b2' }}>
          Vous serez notifie des que l'equipe sera mobilisee
        </p>
      </div>

      <button
        onClick={onGoToTracking}
        className="w-full py-4 rounded-xl font-bold text-white text-[15px] transition-all active:scale-[0.97] flex items-center justify-center gap-2 font-body bg-gradient-to-r from-sahel-700 to-sahel-600 shadow-sahel"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="2" />
          <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
        </svg>
        Suivre mon alerte
      </button>
    </div>
  );
}
