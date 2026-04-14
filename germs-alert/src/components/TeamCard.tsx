import { TeamInfo } from '../types';

function Stars({ score }: { score: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={`text-sm ${i < Math.floor(score) ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
      ))}
      <span className="text-xs text-gray-400 ml-1 font-semibold">{score.toFixed(1)}</span>
    </span>
  );
}

export default function TeamCard({ team }: { team: TeamInfo }) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100 fade-in">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xl shadow-lg shadow-blue-500/20">🚒</div>
        <div>
          <p className="font-bold text-gray-900 text-[15px]">{team.nom}</p>
          <p className="text-xs text-gray-500">{team.unite} — {team.type_vehicule}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-xl p-2.5 text-center">
          <p className="text-lg font-extrabold text-blue-600">{team.distance_km}<span className="text-xs font-medium ml-0.5">km</span></p>
          <p className="text-[10px] text-gray-400 font-medium">Distance</p>
        </div>
        <div className="bg-white rounded-xl p-2.5 text-center">
          <p className="text-lg font-extrabold text-emerald-600">{team.eta_minutes}<span className="text-xs font-medium ml-0.5">min</span></p>
          <p className="text-[10px] text-gray-400 font-medium">ETA</p>
        </div>
        <div className="bg-white rounded-xl p-2.5 text-center">
          <Stars score={team.note_moyenne} />
          <p className="text-[10px] text-gray-400 font-medium">Note</p>
        </div>
      </div>
    </div>
  );
}
