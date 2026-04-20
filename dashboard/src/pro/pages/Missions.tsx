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
    {
      key: 'all' as const,
      label: `Toutes (${missions.length})`,
      active: 'border-accent-600 text-accent-400 bg-accent-600/10',
      inactive: 'border-white/8 text-slate-500 hover:border-white/15 hover:text-slate-400',
    },
    {
      key: 'mine' as const,
      label: 'Mes missions',
      active: 'border-accent-600 text-accent-400 bg-accent-600/10',
      inactive: 'border-white/8 text-slate-500 hover:border-white/15 hover:text-slate-400',
    },
    {
      key: 'haute' as const,
      label: 'Priorite haute',
      active: 'border-red-600/60 text-red-400 bg-red-900/15',
      inactive: 'border-white/8 text-slate-500 hover:border-white/15 hover:text-slate-400',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 fade-in">
      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-full text-xs font-bold border-2 whitespace-nowrap transition-all active:scale-[0.97] font-body ${
              filter === f.key ? f.active : f.inactive
            }`}
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Mission list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <span
              className="text-slate-600 text-2xl font-mono"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              &#x25A2;
            </span>
          </div>
          <p
            className="text-sm text-slate-500 font-body"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            Aucune mission dans cette categorie
          </p>
        </div>
      ) : (
        filtered.map(m => (
          <MissionCard key={m.id} mission={m} onViewDetails={onViewDetails} onAccept={onAccept} />
        ))
      )}
    </div>
  );
}
