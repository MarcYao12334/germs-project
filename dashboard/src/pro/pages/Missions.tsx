import { useState } from 'react';
import { Mission } from '../lib/data';
import MissionCard from '../components/MissionCard';

interface Props {
  missions: Mission[];
  onViewDetails: (id: string) => void;
  onAccept: (id: string) => void;
}

export default function Missions({ missions, onViewDetails, onAccept }: Props) {
  const [filter, setFilter] = useState<'all' | 'mine' | 'haute'>('all');

  const filtered = missions.filter(m => {
    if (filter === 'mine') return m.equipe_assignee;
    if (filter === 'haute') return m.priorite === 'HAUTE';
    return true;
  });

  const activeMissions = missions.filter(m => m.statut !== 'TERMINE');

  const filters = [
    { key: 'all' as const, label: `Toutes (${missions.length})`, color: 'blue' },
    { key: 'mine' as const, label: 'Mes missions', color: 'gray' },
    { key: 'haute' as const, label: 'Priorite haute', color: 'red' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 fade-in">
      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {filters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-full text-xs font-bold border-2 whitespace-nowrap transition-all ${
              filter === f.key
                ? f.color === 'blue' ? 'border-blue-500 text-blue-700 bg-blue-50'
                : f.color === 'red' ? 'border-red-500 text-red-700 bg-red-50'
                : 'border-gray-800 text-gray-800 bg-gray-50'
                : 'border-gray-200 text-gray-500 bg-white hover:bg-gray-50'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Mission list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-sm text-gray-400">Aucune mission dans cette categorie</p>
        </div>
      ) : (
        filtered.map(m => (
          <MissionCard key={m.id} mission={m} onViewDetails={onViewDetails} onAccept={onAccept} />
        ))
      )}
    </div>
  );
}
