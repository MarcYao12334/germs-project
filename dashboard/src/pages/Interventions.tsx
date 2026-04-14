import { useState } from 'react';
import { mockInterventions, mockTeams, Intervention } from '../data/mockData';

const statusConfig: Record<string, { bg: string; text: string; label: string; icon: string }> = {
  NOUVEAU: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Nouveau', icon: '🟦' },
  EN_ROUTE: { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'En route', icon: '🟣' },
  SUR_PLACE: { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'Sur place', icon: '🟠' },
  TERMINE: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Terminée', icon: '🟢' },
};

const prioriteConfig: Record<string, { bg: string; text: string }> = {
  HAUTE: { bg: 'bg-red-500/20', text: 'text-red-400' },
  MOYENNE: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
  FAIBLE: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 60) return `${min} min`;
  return `${Math.floor(min / 60)}h${min % 60 > 0 ? `${min % 60}` : ''}`;
}

export default function Interventions() {
  const [interventions, setInterventions] = useState<Intervention[]>(mockInterventions);
  const [filter, setFilter] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = filter ? interventions.filter(i => i.statut === filter) : interventions;
  const selected = selectedId ? interventions.find(i => i.id === selectedId) : null;

  const handleStatusChange = (id: string, newStatus: string) => {
    setInterventions(prev => prev.map(i => i.id === id ? {
      ...i,
      statut: newStatus as any,
      arrivee_at: newStatus === 'SUR_PLACE' ? new Date().toISOString() : i.arrivee_at,
      fin_at: newStatus === 'TERMINE' ? new Date().toISOString() : i.fin_at,
    } : i));
  };

  const handleAssignTeam = (interventionId: string, teamId: string) => {
    const team = mockTeams.find(t => t.id === teamId);
    if (team) {
      setInterventions(prev => prev.map(i => i.id === interventionId ? {
        ...i, equipe_id: teamId, equipe_nom: team.nom, equipe_unite: team.unite,
      } : i));
    }
  };

  return (
    <div className="p-5 flex gap-4 h-[calc(100vh-48px)]">
      {/* List */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Interventions</h2>
            <p className="text-xs text-gray-500">{interventions.filter(i => i.statut !== 'TERMINE').length} interventions actives</p>
          </div>
        </div>

        <div className="flex gap-1.5 mb-3 flex-wrap">
          {[{ key: '', label: 'Toutes' }, ...Object.entries(statusConfig).map(([k, v]) => ({ key: k, label: v.label }))].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${filter === f.key ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700/50'}`}>
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-auto space-y-2">
          {filtered.map(intv => {
            const st = statusConfig[intv.statut];
            const pr = prioriteConfig[intv.priorite];
            return (
              <div key={intv.id} onClick={() => setSelectedId(intv.id)}
                className={`card-hover p-3 cursor-pointer ${selectedId === intv.id ? 'border-red-500/50' : ''}`}>
                <div className="flex items-center gap-3">
                  <span className="text-lg">{intv.type_incident === 'Incendie' ? '🔥' : intv.type_incident === 'Accident de route' ? '🚗' : intv.type_incident === 'Fuite de gaz' ? '💨' : intv.type_incident === 'Inondation' ? '🌊' : '🏥'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-medium text-white">{intv.type_incident}</span>
                      <span className={`badge ${st.bg} ${st.text}`}>{st.icon} {st.label}</span>
                      <span className={`badge ${pr.bg} ${pr.text}`}>{intv.priorite}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-gray-500 font-mono">{intv.code}</span>
                      {intv.equipe_nom && <span className="text-[10px] text-gray-400">🚒 {intv.equipe_nom}</span>}
                      <span className="text-[10px] text-gray-500">📍 {intv.adresse?.split(',')[0]}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {intv.eta_minutes !== null && intv.eta_minutes > 0 && <p className="text-sm font-mono text-amber-400">{intv.eta_minutes} min</p>}
                    <p className="text-[10px] text-gray-500">{timeAgo(intv.created_at)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="w-96 card p-4 overflow-y-auto shrink-0">
          <h3 className="text-sm font-semibold text-white mb-3">Détail — {selected.code}</h3>
          
          <div className="space-y-3">
            <div className="flex gap-2">
              <span className={`badge ${statusConfig[selected.statut].bg} ${statusConfig[selected.statut].text}`}>{statusConfig[selected.statut].label}</span>
              <span className={`badge ${prioriteConfig[selected.priorite].bg} ${prioriteConfig[selected.priorite].text}`}>{selected.priorite}</span>
            </div>

            <div>
              <p className="text-[10px] text-gray-500 mb-0.5">Type d'incident</p>
              <p className="text-sm text-white">{selected.type_incident}</p>
            </div>

            <div>
              <p className="text-[10px] text-gray-500 mb-0.5">Localisation</p>
              <p className="text-sm text-white">📍 {selected.adresse}</p>
              <p className="text-[10px] text-gray-500">GPS: {selected.lat.toFixed(4)}, {selected.lng.toFixed(4)}</p>
            </div>

            {selected.equipe_nom ? (
              <div>
                <p className="text-[10px] text-gray-500 mb-0.5">Équipe assignée</p>
                <p className="text-sm text-white">🚒 {selected.equipe_nom}</p>
                <p className="text-[10px] text-gray-400">{selected.equipe_unite}</p>
              </div>
            ) : (
              <div>
                <p className="text-[10px] text-gray-500 mb-1">Assigner une équipe</p>
                <select onChange={e => handleAssignTeam(selected.id, e.target.value)} className="input-field text-xs" defaultValue="">
                  <option value="" disabled>Sélectionner...</option>
                  {mockTeams.filter(t => t.statut === 'DISPONIBLE').map(t => (
                    <option key={t.id} value={t.id}>{t.nom} — {t.unite}</option>
                  ))}
                </select>
              </div>
            )}

            {selected.eta_minutes !== null && selected.eta_minutes > 0 && (
              <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">📏 Distance</span>
                  <span className="text-white">{selected.distance_km} km</span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-gray-400">⏱️ ETA</span>
                  <span className="text-amber-400 font-mono">{selected.eta_minutes} min</span>
                </div>
              </div>
            )}

            <div>
              <p className="text-[10px] text-gray-500 mb-0.5">Chronologie</p>
              <div className="text-xs space-y-1">
                <p className="text-gray-400">🕐 Début: {new Date(selected.debut_at).toLocaleString('fr-FR')}</p>
                {selected.arrivee_at && <p className="text-gray-400">📍 Arrivée: {new Date(selected.arrivee_at).toLocaleString('fr-FR')}</p>}
                {selected.fin_at && <p className="text-gray-400">✅ Fin: {new Date(selected.fin_at).toLocaleString('fr-FR')}</p>}
              </div>
            </div>

            {/* Status update buttons */}
            {selected.statut !== 'TERMINE' && (
              <div>
                <p className="text-[10px] text-gray-500 mb-1.5">Mettre à jour le statut</p>
                <div className="flex gap-2">
                  {selected.statut === 'NOUVEAU' && <button onClick={() => handleStatusChange(selected.id, 'EN_ROUTE')} className="flex-1 py-2 rounded-lg bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 text-xs font-medium transition-colors">🚒 En route</button>}
                  {(selected.statut === 'EN_ROUTE' || selected.statut === 'NOUVEAU') && <button onClick={() => handleStatusChange(selected.id, 'SUR_PLACE')} className="flex-1 py-2 rounded-lg bg-orange-600/20 text-orange-400 hover:bg-orange-600/30 text-xs font-medium transition-colors">🔥 Sur place</button>}
                  <button onClick={() => handleStatusChange(selected.id, 'TERMINE')} className="flex-1 py-2 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 text-xs font-medium transition-colors">✅ Terminée</button>
                </div>
              </div>
            )}

            {selected.bilan && (
              <div>
                <p className="text-[10px] text-gray-500 mb-0.5">Bilan</p>
                <div className="bg-gray-700/30 rounded-lg p-2 text-xs text-gray-300 space-y-0.5">
                  <p>Véhicules: {selected.bilan.vehicules}</p>
                  <p>Personnel: {selected.bilan.personnel}</p>
                  <p>Victimes: {selected.bilan.victimes}</p>
                  <p>Actions: {selected.bilan.actions?.join(', ')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
