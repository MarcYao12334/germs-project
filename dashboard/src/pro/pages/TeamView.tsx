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
      {/* Team header */}
      <div className="flex flex-col items-center mt-4 mb-6">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl shadow-cyan-900/30 mb-3"
          style={{
            background: 'linear-gradient(135deg, #0c4a6e 0%, #0891b2 100%)',
            border: '1px solid rgba(8,145,178,0.20)',
          }}
        >
          <span
            className="text-lg font-bold text-white font-mono"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            [E]
          </span>
        </div>
        <h2
          className="text-xl font-extrabold text-white font-display"
          style={{ fontFamily: 'Sora, sans-serif' }}
        >
          {team.nom}
        </h2>
        <p
          className="text-sm text-slate-500 font-body"
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          {team.unite} &mdash;
          <span
            className="ml-1 text-slate-600 font-mono"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            {team.code}
          </span>
        </p>
      </div>

      {/* Chef card */}
      <div
        className="rounded-2xl p-4 mb-5"
        style={{ background: 'rgba(8,145,178,0.07)', border: '1px solid rgba(8,145,178,0.18)' }}
      >
        <p
          className="text-[10px] font-bold mb-1 tracking-widest uppercase font-body"
          style={{ fontFamily: 'Manrope, sans-serif', color: '#0891b2' }}
        >
          Chef d'equipe
        </p>
        <p
          className="text-[15px] font-bold text-slate-200 font-display"
          style={{ fontFamily: 'Sora, sans-serif' }}
        >
          {team.chef_grade} {team.chef}
        </p>
      </div>

      {/* Members header */}
      <div className="flex items-center justify-between mb-2">
        <p
          className="text-[10px] font-bold text-slate-600 tracking-widest uppercase font-body"
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          Membres ({team.membres.length})
        </p>
        <button
          onClick={() => setAdding(true)}
          className="text-xs font-bold transition-colors font-body"
          style={{ fontFamily: 'Manrope, sans-serif', color: '#22d3ee' }}
        >
          + Ajouter
        </button>
      </div>

      <div className="space-y-2 mb-4">
        {team.membres.map((m, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-2xl px-4 py-3"
            style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-md shadow-cyan-900/20"
              style={{ background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)' }}
            >
              {m.prenoms[0]}{m.nom[0]}
            </div>
            <div className="flex-1">
              <p
                className="text-sm font-semibold text-slate-200 font-body"
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                {m.prenoms} {m.nom}
              </p>
              <p
                className="text-[11px] text-slate-500 font-body"
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                {m.grade} &mdash; {m.role}
              </p>
            </div>
            {i === 0 ? (
              <span
                className="px-2 py-0.5 rounded-lg text-[10px] font-bold font-body"
                style={{ background: 'rgba(8,145,178,0.15)', color: '#67e8f9', border: '1px solid rgba(8,145,178,0.25)' }}
              >
                Chef
              </span>
            ) : (
              <button
                onClick={() => removeMember(i)}
                className="w-8 h-8 rounded-lg text-red-500 flex items-center justify-center text-sm hover:bg-red-900/20 transition-colors"
              >
                &#x2715;
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add member form */}
      {adding && (
        <div
          className="rounded-2xl p-4 mb-5 fade-in"
          style={{
            background: 'rgba(8,145,178,0.04)',
            border: '2px dashed rgba(8,145,178,0.20)',
          }}
        >
          <p
            className="text-[10px] font-bold mb-3 tracking-widest uppercase font-body"
            style={{ fontFamily: 'Manrope, sans-serif', color: '#0891b2' }}
          >
            Nouveau membre
          </p>
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
            <button
              onClick={addMember}
              disabled={!newNom || !newPrenoms}
              className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white transition-all active:scale-[0.97] disabled:opacity-40 shadow-md shadow-cyan-900/15 font-body"
              style={{ background: 'linear-gradient(180deg, #0891b2 0%, #0e7490 100%)', fontFamily: 'Manrope, sans-serif' }}
            >
              Ajouter
            </button>
            <button
              onClick={() => setAdding(false)}
              className="px-4 py-2.5 rounded-xl font-semibold text-sm text-slate-300 transition-all hover:bg-white/5 font-body"
              style={{ border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'Manrope, sans-serif' }}
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Logout */}
      <button
        onClick={onLogout}
        className="w-full py-3 rounded-2xl font-bold text-sm text-red-500 hover:bg-red-900/15 transition-colors mt-4 font-body"
        style={{ border: '2px solid rgba(127,29,29,0.40)', fontFamily: 'Manrope, sans-serif' }}
      >
        Deconnexion
      </button>
    </div>
  );
}
