import { useState } from 'react';
import { mockCallLogs, mockInterventions } from '../data/mockData';

export default function History() {
  const [tab, setTab] = useState<'calls' | 'interventions'>('calls');

  const completedInterventions = mockInterventions.filter(i => i.statut === 'TERMINE');

  return (
    <div className="p-5">
      <h2 className="text-xl font-bold text-white mb-1">Historique</h2>
      <p className="text-xs text-gray-500 mb-4">Logs d'appels et interventions passées</p>

      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('calls')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${tab === 'calls' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}>
          📞 Historique d'appels ({mockCallLogs.length})
        </button>
        <button onClick={() => setTab('interventions')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${tab === 'interventions' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}>
          🚒 Interventions terminées ({completedInterventions.length})
        </button>
      </div>

      {tab === 'calls' ? (
        <div className="card overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-700/30 text-gray-400">
                <th className="text-left p-3 font-medium">Date / Heure</th>
                <th className="text-left p-3 font-medium">Durée</th>
                <th className="text-left p-3 font-medium">Opérateur</th>
                <th className="text-left p-3 font-medium">N° appelé</th>
                <th className="text-left p-3 font-medium">Canal</th>
                <th className="text-left p-3 font-medium">Réf.</th>
              </tr>
            </thead>
            <tbody>
              {mockCallLogs.map(log => (
                <tr key={log.id} className="border-t border-gray-700/30 hover:bg-gray-700/20">
                  <td className="p-3 text-gray-300">{new Date(log.date).toLocaleString('fr-FR')}</td>
                  <td className="p-3 text-gray-300">{Math.floor(log.duree_secondes / 60)}:{(log.duree_secondes % 60).toString().padStart(2, '0')}</td>
                  <td className="p-3 text-gray-300">{log.operateur}</td>
                  <td className="p-3 text-blue-400">{log.numero_appele}</td>
                  <td className="p-3"><span className="badge bg-gray-700 text-gray-300">{log.canal}</span></td>
                  <td className="p-3 text-gray-500 font-mono">{log.alerte_id || log.intervention_id || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-2">
          {completedInterventions.map(intv => (
            <div key={intv.id} className="card p-4">
              <div className="flex items-center gap-3">
                <span className="text-lg">{intv.type_incident === 'Fuite de gaz' ? '💨' : '🌊'}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{intv.type_incident}</span>
                    <span className="badge bg-emerald-500/20 text-emerald-400">Terminée</span>
                    <span className="text-[10px] text-gray-500 font-mono">{intv.code}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">📍 {intv.adresse} — 🚒 {intv.equipe_nom}</p>
                </div>
                <div className="text-right text-[10px] text-gray-500">
                  <p>{new Date(intv.debut_at).toLocaleDateString('fr-FR')}</p>
                  <p>Durée: {intv.fin_at && intv.debut_at ? Math.round((new Date(intv.fin_at).getTime() - new Date(intv.debut_at).getTime()) / 60000) : '?'} min</p>
                </div>
              </div>
              {intv.bilan && (
                <div className="mt-2 bg-gray-700/20 rounded-lg p-2 text-[10px] text-gray-400 flex gap-4">
                  <span>Véhicules: {intv.bilan.vehicules}</span>
                  <span>Personnel: {intv.bilan.personnel}</span>
                  <span>Victimes: {intv.bilan.victimes}</span>
                  <span>Actions: {intv.bilan.actions?.join(', ')}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Export buttons */}
      <div className="mt-4 flex gap-2">
        <button className="btn-secondary text-xs">📄 Export PDF</button>
        <button className="btn-secondary text-xs">📊 Export Excel</button>
        <button className="btn-secondary text-xs">📋 Export CSV</button>
      </div>
    </div>
  );
}
