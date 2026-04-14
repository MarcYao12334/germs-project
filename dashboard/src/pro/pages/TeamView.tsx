import { useState } from 'react';
import { ProTeam } from '../lib/data';
import { proStorage } from '../lib/storage';

const grades = ['Commandant', 'Capitaine', 'Lieutenant', 'Sergent-Chef', 'Sergent', 'Caporal-Chef', 'Caporal', 'Sapeur 1C', 'Sapeur'];
const roles = ["Chef d'equipe", 'Conducteur', 'Equipier', 'Secouriste', 'Infirmier', 'Plongeur', 'Specialiste'];

interface Props { team: ProTeam; onTeamUpdate: (t: ProTeam) => void; onLogout: () => void; }

export default function TeamView({ team, onTeamUpdate, onLogout }: Props) {
  const [adding, setAdding] = useState(false);
  const [newNom, setNewNom] = useState('');
  const [newPrenoms, setNewPrenoms] = useState('');
  const [newGrade, setNewGrade] = useState(grades[4]);
  const [newRole, setNewRole] = useState(roles[2]);

  const addMember = () => {
    if (!newNom || !newPrenoms) return;
    const updated = { ...team, membres: [...team.membres, { nom: newNom, prenoms: newPrenoms, grade: newGrade, role: newRole }] };
    proStorage.saveTeam(updated);
    onTeamUpdate(updated);
    setNewNom(''); setNewPrenoms(''); setNewGrade(grades[4]); setNewRole(roles[2]); setAdding(false);
  };

  const removeMember = (idx: number) => {
    if (idx === 0) return;
    const updated = { ...team, membres: team.membres.filter((_, i) => i !== idx) };
    proStorage.saveTeam(updated);
    onTeamUpdate(updated);
  };

  return (
    <div className="flex-1 overflow-y-auto p-5 fade-in">
      <div className="flex flex-col items-center mt-4 mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-3xl shadow-xl shadow-blue-500/20 mb-3">🚒</div>
        <h2 className="text-xl font-extrabold text-gray-900">{team.nom}</h2>
        <p className="text-sm text-gray-500">{team.unite} — {team.code}</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-5">
        <p className="text-xs font-bold text-blue-600 mb-1">Chef d'equipe</p>
        <p className="text-[15px] font-bold text-gray-900">{team.chef_grade} {team.chef}</p>
      </div>

      {/* Members */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-gray-500">MEMBRES ({team.membres.length})</p>
        <button onClick={() => setAdding(true)} className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
          + Ajouter
        </button>
      </div>

      <div className="space-y-2 mb-4">
        {team.membres.map((m, i) => (
          <div key={i} className="flex items-center gap-3 bg-white/80 rounded-2xl px-4 py-3 border border-gray-100">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
              {m.prenoms[0]}{m.nom[0]}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">{m.prenoms} {m.nom}</p>
              <p className="text-[11px] text-gray-500">{m.grade} — {m.role}</p>
            </div>
            {i === 0 ? (
              <span className="px-2 py-0.5 rounded-lg bg-blue-100 text-blue-700 text-[10px] font-bold">Chef</span>
            ) : (
              <button onClick={() => removeMember(i)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center text-sm hover:bg-red-100 transition-colors">✕</button>
            )}
          </div>
        ))}
      </div>

      {/* Add member form */}
      {adding && (
        <div className="bg-blue-50/50 border-2 border-dashed border-blue-200 rounded-2xl p-4 mb-5 fade-in">
          <p className="text-xs font-bold text-blue-600 mb-3">NOUVEAU MEMBRE</p>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input className="input-field text-sm" value={newNom} onChange={e => setNewNom(e.target.value)} placeholder="Nom" />
            <input className="input-field text-sm" value={newPrenoms} onChange={e => setNewPrenoms(e.target.value)} placeholder="Prenoms" />
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <select value={newGrade} onChange={e => setNewGrade(e.target.value)} className="input-field text-sm">
              {grades.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <select value={newRole} onChange={e => setNewRole(e.target.value)} className="input-field text-sm">
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={addMember} disabled={!newNom || !newPrenoms}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-40">
              Ajouter
            </button>
            <button onClick={() => setAdding(false)} className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold text-sm transition-all">
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Logout */}
      <button onClick={onLogout} className="w-full py-3 border-2 border-red-200 text-red-600 rounded-2xl font-bold text-sm hover:bg-red-50 transition-colors mt-4">
        Deconnexion
      </button>
    </div>
  );
}
