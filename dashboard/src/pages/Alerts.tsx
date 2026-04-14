import { useState } from 'react';
import AlertCard from '../components/AlertCard';
import { mockAlerts, Alert } from '../data/mockData';

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [filter, setFilter] = useState<string>('ALL');

  const handleValidate = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, statut: 'VALIDATED' as const } : a));
  };

  const handleReject = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, statut: 'REJECTED' as const } : a));
  };

  const handleCall = (tel: string) => {
    alert(`📞 Appel en cours vers ${tel}\n(Simulation — en production, utilise WhatsApp/SMS/Voice)`);
  };

  const handleMerge = (id: string) => {
    alert(`🔗 Fusion de l'alerte ${id} avec l'intervention à proximité\n(Simulation)`);
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, statut: 'DUPLICATE' as const } : a));
  };

  const filtered = filter === 'ALL' ? alerts : alerts.filter(a => a.statut === filter);
  const counts = {
    ALL: alerts.length,
    PENDING: alerts.filter(a => a.statut === 'PENDING').length,
    VALIDATED: alerts.filter(a => a.statut === 'VALIDATED').length,
    REJECTED: alerts.filter(a => a.statut === 'REJECTED').length,
  };

  const filters = [
    { key: 'ALL', label: 'Toutes', count: counts.ALL },
    { key: 'PENDING', label: 'En attente', count: counts.PENDING, color: 'text-amber-400' },
    { key: 'VALIDATED', label: 'Validées', count: counts.VALIDATED, color: 'text-emerald-400' },
    { key: 'REJECTED', label: 'Rejetées', count: counts.REJECTED, color: 'text-red-400' },
  ];

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white">Alertes Citoyennes</h2>
          <p className="text-xs text-gray-500">{counts.PENDING} alertes en attente de validation</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {filters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f.key ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'}`}>
            {f.label} <span className={`ml-1 ${filter !== f.key ? (f.color || 'text-gray-500') : ''}`}>({f.count})</span>
          </button>
        ))}
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-gray-500">Aucune alerte dans cette catégorie</p>
          </div>
        ) : (
          filtered.map(alert => (
            <AlertCard key={alert.id} alert={alert} onValidate={handleValidate} onReject={handleReject} onCall={handleCall} onMerge={handleMerge} />
          ))
        )}
      </div>
    </div>
  );
}
