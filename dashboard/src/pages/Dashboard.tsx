import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import KpiCard from '../components/KpiCard';
import { mockStats, mockAlerts, mockInterventions, mockTeams } from '../data/mockData';

export default function Dashboard() {
  const [stats, setStats] = useState(mockStats);
  const [tick, setTick] = useState(0);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
      setStats(s => ({
        ...s,
        temps_moyen_minutes: Math.round((s.temps_moyen_minutes + (Math.random() - 0.5) * 2) * 10) / 10,
        taux_reussite: Math.min(100, Math.max(80, Math.round((s.taux_reussite + (Math.random() - 0.5)) * 10) / 10)),
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const activeInterventions = mockInterventions.filter(i => i.statut !== 'TERMINE');
  const pendingAlerts = mockAlerts.filter(a => a.statut === 'PENDING');

  return (
    <div className="p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-white">Dashboard</h2>
          <p className="text-xs text-gray-500">Vue d'ensemble temps réel — France</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-gray-400">Mise à jour automatique</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <KpiCard label="Interventions actives" value={stats.interventions_actives} icon="🚒" color="red" trend={{ value: 12, label: "vs hier" }} />
        <KpiCard label="Alertes en attente" value={stats.alertes_en_attente} icon="🔔" color="amber" pulse={stats.alertes_en_attente > 0} />
        <KpiCard label="Équipes disponibles" value={stats.equipes_disponibles} icon="👥" color="blue" />
        <KpiCard label="Temps moyen (min)" value={stats.temps_moyen_minutes.toFixed(1)} icon="⏱️" color="purple" trend={{ value: -5, label: "vs sem. dern." }} />
        <KpiCard label="Taux de réussite" value={`${stats.taux_reussite}%`} icon="✅" color="emerald" trend={{ value: 2.1, label: "vs mois dern." }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Active Interventions */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">🚒 Interventions en cours</h3>
            <Link to="/interventions" className="text-xs text-red-400 hover:text-red-300">Voir tout →</Link>
          </div>
          <div className="space-y-2">
            {activeInterventions.map(intv => {
              const statusColor = intv.statut === 'EN_ROUTE' ? 'text-purple-400 bg-purple-500/10' : 'text-orange-400 bg-orange-500/10';
              return (
                <div key={intv.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors">
                  <span className="text-lg">{intv.type_incident === 'Incendie' ? '🔥' : intv.type_incident === 'Accident de route' ? '🚗' : '🏥'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-white">{intv.type_incident}</span>
                      <span className={`badge ${statusColor}`}>{intv.statut === 'EN_ROUTE' ? 'En route' : 'Sur place'}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 truncate">{intv.equipe_nom} — {intv.adresse}</p>
                  </div>
                  {intv.eta_minutes !== null && intv.eta_minutes > 0 && (
                    <div className="text-right">
                      <p className="text-xs font-mono text-amber-400">{intv.eta_minutes} min</p>
                      <p className="text-[10px] text-gray-500">{intv.distance_km} km</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Pending Alerts */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">🔔 Alertes en attente</h3>
            <Link to="/alerts" className="text-xs text-red-400 hover:text-red-300">Voir tout →</Link>
          </div>
          <div className="space-y-2">
            {pendingAlerts.slice(0, 4).map(alert => (
              <div key={alert.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/10 hover:border-amber-500/20 transition-colors">
                <span className="text-lg">{alert.type_incident === 'Incendie' ? '🔥' : alert.type_incident === 'Accident de route' ? '🚗' : alert.type_incident === 'Fuite de gaz' ? '💨' : '⚠️'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-white">{alert.type_incident}</span>
                    {alert.similar_alert_nearby && <span className="badge bg-orange-500/20 text-orange-400">⚠️ Doublon?</span>}
                  </div>
                  <p className="text-[10px] text-gray-500 truncate">{alert.citoyen_prenoms} {alert.citoyen_nom} — {alert.adresse}</p>
                </div>
                <div className="flex gap-1.5">
                  <button className="w-7 h-7 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 flex items-center justify-center text-xs transition-colors">✓</button>
                  <button className="w-7 h-7 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 flex items-center justify-center text-xs transition-colors">✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Teams Status */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">👥 État des équipes</h3>
            <Link to="/teams" className="text-xs text-red-400 hover:text-red-300">Voir tout →</Link>
          </div>
          <div className="space-y-2">
            {mockTeams.map(team => {
              const statusConf = team.statut === 'DISPONIBLE'
                ? { color: 'text-emerald-400 bg-emerald-500/10', label: 'Disponible' }
                : team.statut === 'EN_MISSION'
                ? { color: 'text-red-400 bg-red-500/10', label: 'En mission' }
                : { color: 'text-blue-400 bg-blue-500/10', label: 'Retour caserne' };
              return (
                <div key={team.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-700/30">
                  <span className="text-lg">🚒</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-white">{team.nom}</span>
                      <span className={`badge ${statusConf.color}`}>{statusConf.label}</span>
                    </div>
                    <p className="text-[10px] text-gray-500">{team.unite} — {team.type_vehicule} — {team.membres.length} pers.</p>
                  </div>
                  <span className="text-xs text-amber-400">{'★'.repeat(Math.round(team.note_moyenne))} <span className="text-gray-500">{team.note_moyenne.toFixed(1)}</span></span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Stats Chart */}
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-white mb-3">📈 Activité récente</h3>
          <div className="space-y-3">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, i) => {
              const alertCount = Math.floor(Math.random() * 15) + 3;
              const intCount = Math.floor(Math.random() * 12) + 2;
              const maxVal = 20;
              return (
                <div key={day} className="flex items-center gap-3">
                  <span className="text-[10px] text-gray-500 w-6">{day}</span>
                  <div className="flex-1 flex items-center gap-1">
                    <div className="h-3 rounded bg-amber-500/30" style={{ width: `${(alertCount / maxVal) * 100}%` }} />
                    <div className="h-3 rounded bg-red-500/30" style={{ width: `${(intCount / maxVal) * 100}%` }} />
                  </div>
                  <span className="text-[10px] text-gray-500 w-12 text-right">{alertCount}a / {intCount}i</span>
                </div>
              );
            })}
            <div className="flex gap-4 mt-1 text-[10px] text-gray-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-500/30" /> Alertes</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-red-500/30" /> Interventions</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
