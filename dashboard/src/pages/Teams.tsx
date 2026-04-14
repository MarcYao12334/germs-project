import { useState } from 'react';
import { mockTeams, Team } from '../data/mockData';

export default function Teams() {
  const [teams] = useState<Team[]>(mockTeams);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = selectedId ? teams.find(t => t.id === selectedId) : null;

  const statusConf = (s: string) => {
    switch (s) {
      case 'DISPONIBLE': return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Disponible', dot: 'bg-emerald-500' };
      case 'EN_MISSION': return { bg: 'bg-red-500/20', text: 'text-red-400', label: 'En mission', dot: 'bg-red-500' };
      default: return { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Retour caserne', dot: 'bg-blue-500' };
    }
  };

  return (
    <div className="p-5 flex gap-4 h-[calc(100vh-48px)]">
      {/* Grid */}
      <div className="flex-1 overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Équipes</h2>
            <p className="text-xs text-gray-500">{teams.length} équipes — {teams.filter(t => t.statut === 'DISPONIBLE').length} disponibles</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {teams.map(team => {
            const sc = statusConf(team.statut);
            return (
              <div key={team.id} onClick={() => setSelectedId(team.id)}
                className={`card-hover p-4 cursor-pointer ${selectedId === team.id ? 'border-red-500/50' : ''}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-red-600/20 flex items-center justify-center text-lg">🚒</div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-white">{team.nom}</h3>
                    <p className="text-[10px] text-gray-500">{team.unite} — {team.code_equipe}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
                    <span className={`text-[10px] ${sc.text}`}>{sc.label}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center mb-3">
                  <div className="bg-gray-700/30 rounded-lg p-1.5">
                    <p className="text-xs font-semibold text-white">{team.membres.length}</p>
                    <p className="text-[10px] text-gray-500">Membres</p>
                  </div>
                  <div className="bg-gray-700/30 rounded-lg p-1.5">
                    <p className="text-xs font-semibold text-amber-400">{'★'.repeat(Math.round(team.note_moyenne))}</p>
                    <p className="text-[10px] text-gray-500">{team.note_moyenne.toFixed(1)}/5</p>
                  </div>
                  <div className="bg-gray-700/30 rounded-lg p-1.5">
                    <p className="text-xs font-semibold text-white">{team.type_vehicule.split(' ')[0]}</p>
                    <p className="text-[10px] text-gray-500">{team.immatriculation}</p>
                  </div>
                </div>

                <p className="text-[10px] text-gray-500">📞 {team.telephone}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="w-80 card p-4 overflow-y-auto shrink-0">
          <h3 className="text-sm font-semibold text-white mb-1">🚒 {selected.nom}</h3>
          <p className="text-[10px] text-gray-500 mb-4">{selected.unite} — {selected.code_equipe}</p>

          <div className="space-y-3">
            <div className="bg-gray-700/30 rounded-lg p-3">
              <p className="text-[10px] text-gray-500 mb-1">Véhicule</p>
              <p className="text-sm text-white">{selected.type_vehicule}</p>
              <p className="text-xs text-gray-400">{selected.immatriculation}</p>
            </div>

            <div>
              <p className="text-[10px] text-gray-500 mb-2">Membres ({selected.membres.length})</p>
              <div className="space-y-1.5">
                {selected.membres.map(m => (
                  <div key={m.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-700/30">
                    <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center text-[10px] text-gray-300">{m.prenoms[0]}{m.nom[0]}</div>
                    <div className="flex-1">
                      <p className="text-xs text-white">{m.prenoms} {m.nom}</p>
                      <p className="text-[10px] text-gray-500">{m.grade} — {m.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-700/30 rounded-lg p-3">
              <p className="text-[10px] text-gray-500 mb-1">Note moyenne</p>
              <div className="flex items-center gap-2">
                <span className="text-lg text-amber-400">{'★'.repeat(Math.round(selected.note_moyenne))}<span className="text-gray-600">{'★'.repeat(5 - Math.round(selected.note_moyenne))}</span></span>
                <span className="text-sm text-white">{selected.note_moyenne.toFixed(1)}/5</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
