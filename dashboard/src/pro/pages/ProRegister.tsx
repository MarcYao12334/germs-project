import { useState } from 'react';
import { ProTeam } from '../lib/data';
import { proStorage } from '../lib/storage';
import { proSync } from '../lib/sync';

const grades = ['Commandant', 'Capitaine', 'Lieutenant', 'Sergent-Chef', 'Sergent', 'Caporal-Chef', 'Caporal', 'Sapeur 1C', 'Sapeur'];
const roles = ["Chef d'equipe", 'Conducteur', 'Equipier', 'Secouriste', 'Infirmier', 'Plongeur', 'Specialiste'];
const unites = ['GSPM Plateau', 'GSPM Cocody', 'GSPM Abobo', 'GSPM Yopougon', 'GSPM Marcory', 'GSPM Treichville', 'GSPM Port-Bouet', 'GSPM Adjame', 'GSPM Koumassi', 'GSPM Attiecoube'];
const vehiculeTypes = ['Camion citerne', 'Ambulance', 'Echelle pivotante', 'Vehicule de secours routier', 'Fourgon pompe-tonne', 'Vehicule de commandement'];

interface Props { onDone: (team: ProTeam) => void; }

export default function ProRegister({ onDone }: Props) {
  const [step, setStep] = useState<'team' | 'members' | 'otp'>('team');

  // Team info
  const [nomEquipe, setNomEquipe] = useState('');
  const [unite, setUnite] = useState(unites[0]);
  const [typeVehicule, setTypeVehicule] = useState(vehiculeTypes[0]);
  const [immatriculation, setImmatriculation] = useState('');
  const [telephone, setTelephone] = useState('');

  // Chef
  const [chefNom, setChefNom] = useState('');
  const [chefPrenoms, setChefPrenoms] = useState('');
  const [chefGrade, setChefGrade] = useState(grades[2]); // Lieutenant

  // Membres
  const [membres, setMembres] = useState<{ nom: string; prenoms: string; grade: string; role: string }[]>([]);
  const [newNom, setNewNom] = useState('');
  const [newPrenoms, setNewPrenoms] = useState('');
  const [newGrade, setNewGrade] = useState(grades[4]);
  const [newRole, setNewRole] = useState(roles[2]);

  // OTP
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [email, setEmail] = useState('');
  const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

  const handleTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add chef as first member
    setMembres([{ nom: chefNom, prenoms: chefPrenoms, grade: chefGrade, role: "Chef d'equipe" }]);
    setStep('members');
  };

  const addMember = () => {
    if (!newNom || !newPrenoms) return;
    setMembres(prev => [...prev, { nom: newNom, prenoms: newPrenoms, grade: newGrade, role: newRole }]);
    setNewNom(''); setNewPrenoms(''); setNewGrade(grades[4]); setNewRole(roles[2]);
  };

  const removeMember = (idx: number) => {
    if (idx === 0) return; // can't remove chef
    setMembres(prev => prev.filter((_, i) => i !== idx));
  };

  const handleMembersSubmit = () => {
    if (membres.length < 2) { window.alert('Ajoutez au moins 1 membre en plus du chef'); return; }
    const code = generateOtp();
    setGeneratedOtp(code);
    setStep('otp');
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== generatedOtp) { window.alert('Code incorrect. Veuillez reessayer.'); return; }
    const code = `EQ-${nomEquipe.replace(/\s/g, '').substring(0, 6).toUpperCase()}`;
    const team: ProTeam = {
      nom: nomEquipe,
      unite,
      code,
      chef: `${chefPrenoms} ${chefNom}`,
      chef_grade: chefGrade,
      membres,
    };
    proStorage.saveTeam(team);
    proStorage.setLoggedIn();
    // Notify Dashboard
    proSync.send('team:registered', { ...team, type_vehicule: typeVehicule, immatriculation, telephone });
    onDone(team);
  };

  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <p
      className="text-[10px] font-bold text-slate-600 mb-3 tracking-widest uppercase font-body"
      style={{ fontFamily: 'Manrope, sans-serif' }}
    >
      {children}
    </p>
  );

  const FieldLabel = ({ children }: { children: React.ReactNode }) => (
    <label
      className="block text-[11px] font-bold text-slate-600 mb-1 tracking-wide uppercase font-body"
      style={{ fontFamily: 'Manrope, sans-serif' }}
    >
      {children}
    </label>
  );

  // ── STEP 1: Team info ──
  if (step === 'team') {
    return (
      <div className="flex-1 overflow-y-auto p-5 fade-in">
        <div className="text-center mb-7 mt-4">
          <div
            className="w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center shadow-xl shadow-cyan-900/30"
            style={{
              background: 'linear-gradient(135deg, #0c4a6e 0%, #0891b2 100%)',
              border: '1px solid rgba(8,145,178,0.20)',
            }}
          >
            <span
              className="text-lg font-bold text-white font-mono"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              [P]
            </span>
          </div>
          <h2
            className="text-xl font-extrabold text-white mb-1 font-display"
            style={{ fontFamily: 'Sora, sans-serif' }}
          >
            Creer une equipe
          </h2>
          <p
            className="text-sm text-slate-500 font-body"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            GERMS Pro &mdash; Inscription equipe pompiers
          </p>
        </div>

        <form onSubmit={handleTeamSubmit} className="space-y-4">
          <div>
            <FieldLabel>Nom de l'equipe *</FieldLabel>
            <input className="input-field" value={nomEquipe} onChange={e => setNomEquipe(e.target.value)} placeholder="Equipe Alpha" required />
          </div>

          <div>
            <FieldLabel>Unite / Caserne *</FieldLabel>
            <select value={unite} onChange={e => setUnite(e.target.value)} className="input-field">
              {unites.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Type de vehicule</FieldLabel>
              <select value={typeVehicule} onChange={e => setTypeVehicule(e.target.value)} className="input-field text-sm">
                {vehiculeTypes.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <FieldLabel>Immatriculation</FieldLabel>
              <input className="input-field" value={immatriculation} onChange={e => setImmatriculation(e.target.value)} placeholder="CI-1234-AB" />
            </div>
          </div>

          <div>
            <FieldLabel>Email equipe *</FieldLabel>
            <input type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)} placeholder="equipe@gspm.ci" required />
          </div>
          <div>
            <FieldLabel>Telephone equipe *</FieldLabel>
            <div className="flex gap-2">
              <div
                className="input-field w-20 flex items-center justify-center text-sm shrink-0 font-semibold text-slate-500 font-mono"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                +225
              </div>
              <input type="tel" className="input-field flex-1" value={telephone} onChange={e => setTelephone(e.target.value)} placeholder="27 20 21 22 23" required />
            </div>
          </div>

          <div
            className="pt-4 mt-2"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
          >
            <SectionLabel>Chef d'equipe</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>Nom *</FieldLabel>
                <input className="input-field" value={chefNom} onChange={e => setChefNom(e.target.value)} placeholder="Kouame" required />
              </div>
              <div>
                <FieldLabel>Prenoms *</FieldLabel>
                <input className="input-field" value={chefPrenoms} onChange={e => setChefPrenoms(e.target.value)} placeholder="Yao" required />
              </div>
            </div>
            <div className="mt-3">
              <FieldLabel>Grade</FieldLabel>
              <select value={chefGrade} onChange={e => setChefGrade(e.target.value)} className="input-field">
                {grades.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl font-bold text-[15px] text-white shadow-lg shadow-cyan-900/20 transition-all active:scale-[0.97] mt-4 font-display"
            style={{ background: 'linear-gradient(180deg, #0891b2 0%, #0e7490 100%)', fontFamily: 'Sora, sans-serif' }}
          >
            Continuer &mdash; Ajouter les membres
          </button>
        </form>
      </div>
    );
  }

  // ── STEP 2: Members ──
  if (step === 'members') {
    return (
      <div className="flex-1 overflow-y-auto p-5 fade-in">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setStep('team')}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 transition-all active:scale-[0.97]"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            &#x2190;
          </button>
          <div>
            <h2
              className="text-lg font-bold text-white font-display"
              style={{ fontFamily: 'Sora, sans-serif' }}
            >
              Membres de l'equipe
            </h2>
            <p
              className="text-xs text-slate-500 font-body"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              {nomEquipe} &mdash; {unite}
            </p>
          </div>
        </div>

        {/* Current members list */}
        <div className="mb-5">
          <p
            className="text-[10px] font-bold text-slate-600 mb-2 tracking-widest uppercase font-body"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            Equipe ({membres.length} membre{membres.length > 1 ? 's' : ''})
          </p>
          <div className="space-y-2">
            {membres.map((m, i) => (
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
                    className="px-2 py-0.5 rounded-lg text-[10px] font-bold"
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
        </div>

        {/* Add member form */}
        <div
          className="rounded-2xl p-4 mb-5"
          style={{
            background: 'rgba(8,145,178,0.04)',
            border: '2px dashed rgba(8,145,178,0.20)',
          }}
        >
          <p
            className="text-[10px] font-bold mb-3 tracking-widest uppercase font-body"
            style={{ fontFamily: 'Manrope, sans-serif', color: '#0891b2' }}
          >
            + Ajouter un membre
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
          <button
            type="button"
            onClick={addMember}
            disabled={!newNom || !newPrenoms}
            className="w-full py-2.5 rounded-xl font-semibold text-sm text-white transition-all active:scale-[0.97] disabled:opacity-40 shadow-md shadow-cyan-900/15 font-body"
            style={{ background: 'linear-gradient(180deg, #0891b2 0%, #0e7490 100%)', fontFamily: 'Manrope, sans-serif' }}
          >
            + Ajouter a l'equipe
          </button>
        </div>

        <button
          onClick={handleMembersSubmit}
          className="w-full py-3.5 rounded-2xl font-bold text-[15px] text-white shadow-lg shadow-emerald-900/20 transition-all active:scale-[0.97] font-display"
          style={{ background: 'linear-gradient(180deg, #059669 0%, #047857 100%)', fontFamily: 'Sora, sans-serif' }}
        >
          Valider l'equipe ({membres.length} membres)
        </button>
      </div>
    );
  }

  // ── STEP 3: OTP Verification ──
  return (
    <div className="flex-1 flex flex-col p-6 fade-in">
      <h2
        className="text-xl font-bold text-white mb-2 mt-8 font-display"
        style={{ fontFamily: 'Sora, sans-serif' }}
      >
        Verification 2FA
      </h2>
      <p
        className="text-sm text-slate-500 mb-1 font-body"
        style={{ fontFamily: 'Manrope, sans-serif' }}
      >
        Code envoye par SMS au
      </p>
      <p
        className="text-sm font-bold text-slate-300 mb-6 font-mono"
        style={{ fontFamily: 'JetBrains Mono, monospace' }}
      >
        +225 {telephone}
      </p>

      <div
        className="rounded-2xl p-4 mb-5"
        style={{ background: 'rgba(5,150,105,0.07)', border: '1px solid rgba(5,150,105,0.18)' }}
      >
        <p
          className="text-[10px] font-bold text-emerald-500 mb-1 tracking-widest uppercase font-body"
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          Recapitulatif
        </p>
        <p
          className="text-sm text-slate-200 font-semibold font-display"
          style={{ fontFamily: 'Sora, sans-serif' }}
        >
          {nomEquipe}
        </p>
        <p
          className="text-xs text-slate-500 mt-0.5 font-body"
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          {unite} &mdash; {membres.length} membres
        </p>
        <p
          className="text-xs text-slate-500 font-body"
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          Chef: {chefGrade} {chefPrenoms} {chefNom}
        </p>
      </div>

      <div
        className="rounded-2xl px-4 py-3 mb-4 text-center"
        style={{ background: 'rgba(180,83,9,0.09)', border: '1px solid rgba(180,83,9,0.25)' }}
      >
        <p
          className="text-[9px] font-bold uppercase tracking-widest mb-1 font-body"
          style={{ fontFamily: 'Manrope, sans-serif', color: '#d97706' }}
        >
          Mode Test &mdash; Code de verification
        </p>
        <p
          className="text-2xl font-extrabold tracking-[0.3em] font-mono"
          style={{ fontFamily: 'JetBrains Mono, monospace', color: '#fbbf24' }}
        >
          {generatedOtp}
        </p>
      </div>

      <form onSubmit={handleVerify} className="flex-1 flex flex-col">
        <input
          type="text"
          className="input-field text-center text-3xl tracking-[0.5em] py-5 mb-6 font-mono"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
          value={otp}
          onChange={e => setOtp(e.target.value)}
          placeholder="000000"
          maxLength={6}
          autoFocus
        />
        <div className="flex-1" />
        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl font-bold text-[15px] text-white shadow-lg shadow-cyan-900/20 transition-all active:scale-[0.97] font-display"
          style={{ background: 'linear-gradient(180deg, #0891b2 0%, #0e7490 100%)', fontFamily: 'Sora, sans-serif' }}
        >
          Activer GERMS Pro
        </button>
        <button
          type="button"
          onClick={() => setStep('members')}
          className="text-sm text-slate-600 text-center mt-3 hover:text-slate-400 transition-colors font-body"
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          &#x2190; Retour
        </button>
      </form>
    </div>
  );
}
