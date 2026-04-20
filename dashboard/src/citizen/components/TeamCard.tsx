import { TeamInfo } from '../types';

function Stars({ score }: { score: number }) {
  return (
    <span className="inline-flex gap-0.5 items-center">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className="text-sm"
          style={{ color: i < Math.floor(score) ? '#d97706' : '#e7e5e4' }}
        >
          ★
        </span>
      ))}
      <span className="text-xs ml-1 font-semibold font-body" style={{ color: '#a8a29e' }}>
        {score.toFixed(1)}
      </span>
    </span>
  );
}

export default function TeamCard({ team }: { team: TeamInfo }) {
  return (
    <div
      className="rounded-2xl p-4 fade-in"
      style={{
        background: 'linear-gradient(135deg, #fef9f0 0%, #fdf4e3 100%)',
        border: '1px solid rgba(180,83,9,0.12)',
        boxShadow: '0 2px 16px rgba(180,83,9,0.07)',
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #92400e 0%, #b45309 50%, #d97706 100%)',
            boxShadow: '0 4px 14px rgba(180,83,9,0.35)',
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="3" width="15" height="13" rx="2" />
            <path d="M16 8h4l3 4v3h-7V8z" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
        </div>
        <div>
          <p className="font-bold text-[15px] font-display" style={{ color: '#1c1917' }}>
            {team.nom}
          </p>
          <p className="text-xs font-body" style={{ color: '#a8a29e' }}>
            {team.unite} — {team.type_vehicule}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div
          className="rounded-xl p-2.5 text-center"
          style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(180,83,9,0.10)' }}
        >
          <p className="text-lg font-extrabold font-display" style={{ color: '#b45309' }}>
            {team.distance_km}<span className="text-xs font-medium ml-0.5 font-body">km</span>
          </p>
          <p className="text-[10px] font-medium font-body" style={{ color: '#a8a29e' }}>Distance</p>
        </div>
        <div
          className="rounded-xl p-2.5 text-center"
          style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(8,145,178,0.10)' }}
        >
          <p className="text-lg font-extrabold font-display" style={{ color: '#0891b2' }}>
            {team.eta_minutes}<span className="text-xs font-medium ml-0.5 font-body">min</span>
          </p>
          <p className="text-[10px] font-medium font-body" style={{ color: '#a8a29e' }}>ETA</p>
        </div>
        <div
          className="rounded-xl p-2.5 text-center"
          style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(217,119,6,0.10)' }}
        >
          <Stars score={team.note_moyenne} />
          <p className="text-[10px] font-medium font-body" style={{ color: '#a8a29e' }}>Note</p>
        </div>
      </div>
    </div>
  );
}
