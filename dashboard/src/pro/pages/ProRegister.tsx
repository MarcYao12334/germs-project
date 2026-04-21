import { useState } from 'react';
import { ProTeam } from '../lib/data';
import { proStorage } from '../lib/storage';
import { proSync } from '../lib/sync';

const grades = ['Commandant', 'Capitaine', 'Lieutenant', 'Sergent-Chef', 'Sergent', 'Caporal-Chef', 'Caporal', 'Sapeur 1C', 'Sapeur'];
const roles = ["Chef d'equipe", 'Conducteur', 'Equipier', 'Secouriste', 'Infirmier', 'Plongeur', 'Specialiste'];
const unites = ['GSPM Plateau', 'GSPM Cocody', 'GSPM Abobo', 'GSPM Yopougon', 'GSPM Marcory', 'GSPM Treichville', 'GSPM Port-Bouet', 'GSPM Adjame', 'GSPM Koumassi', 'GSPM Attiecoube', 'GSPM Bingerville'];
const vehiculeTypes = ['Camion citerne', 'Ambulance', 'Echelle pivotante', 'Vehicule de secours routier', 'Fourgon pompe-tonne', 'Vehicule de commandement'];
const countries = [
  { code: 'CI', flag: '🇨🇮', dial: '+225', label: "Cote d'Ivoire" },
  { code: 'SN', flag: '🇸🇳', dial: '+221', label: 'Senegal' },
  { code: 'ML', flag: '🇲🇱', dial: '+223', label: 'Mali' },
  { code: 'BF', flag: '🇧🇫', dial: '+226', label: 'Burkina Faso' },
  { code: 'GN', flag: '🇬🇳', dial: '+224', label: 'Guinee' },
  { code: 'TG', flag: '🇹🇬', dial: '+228', label: 'Togo' },
  { code: 'BJ', flag: '🇧🇯', dial: '+229', label: 'Benin' },
  { code: 'NE', flag: '🇳🇪', dial: '+227', label: 'Niger' },
  { code: 'MR', flag: '🇲🇷', dial: '+222', label: 'Mauritanie' },
  { code: 'CM', flag: '🇨🇲', dial: '+237', label: 'Cameroun' },
  { code: 'GA', flag: '🇬🇦', dial: '+241', label: 'Gabon' },
  { code: 'CG', flag: '🇨🇬', dial: '+242', label: 'Congo-Brazzaville' },
  { code: 'CD', flag: '🇨🇩', dial: '+243', label: 'RD Congo' },
  { code: 'TD', flag: '🇹🇩', dial: '+235', label: 'Tchad' },
  { code: 'CF', flag: '🇨🇫', dial: '+236', label: 'Centrafrique' },
  { code: 'GQ', flag: '🇬🇶', dial: '+240', label: 'Guinee Equatoriale' },
  { code: 'MA', flag: '🇲🇦', dial: '+212', label: 'Maroc' },
  { code: 'DZ', flag: '🇩🇿', dial: '+213', label: 'Algerie' },
  { code: 'TN', flag: '🇹🇳', dial: '+216', label: 'Tunisie' },
  { code: 'MG', flag: '🇲🇬', dial: '+261', label: 'Madagascar' },
  { code: 'KM', flag: '🇰🇲', dial: '+269', label: 'Comores' },
  { code: 'DJ', flag: '🇩🇯', dial: '+253', label: 'Djibouti' },
  { code: 'BI', flag: '🇧🇮', dial: '+257', label: 'Burundi' },
  { code: 'RW', flag: '🇷🇼', dial: '+250', label: 'Rwanda' },
  { code: 'FR', flag: '🇫🇷', dial: '+33', label: 'France' },
  { code: 'BE', flag: '🇧🇪', dial: '+32', label: 'Belgique' },
  { code: 'CH', flag: '🇨🇭', dial: '+41', label: 'Suisse' },
  { code: 'CA', flag: '🇨🇦', dial: '+1', label: 'Canada' },
];

interface Props { onDone: (team: ProTeam) => void; }

export default function ProRegister({ onDone }: Props) {
  const [step, setStep] = useState<'team' | 'members' | 'otp'>('team');

  // Country
  const [pays, setPays] = useState('CI');

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
      pays,
    };
    proStorage.saveTeam(team);
    proStorage.setLoggedIn();
    // Notify Dashboard
    proSync.send('team:registered', { ...team, type_vehicule: typeVehicule, immatriculation, telephone, pays });
    onDone(team);
  };

  // ── STEP 1: Team info ──
  if (step === 'team') {
    return (
      <div className="flex-1 overflow-y-auto p-5 fade-in">
        <div className="text-center mb-6 mt-4">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-3xl shadow-xl shadow-blue-500/20">🚒</div>
          <h2 className="text-xl font-extrabold text-gray-900">Creer une equipe</h2>
          <p className="text-sm text-gray-500">GERMS Pro — Inscription equipe pompiers</p>
        </div>

        <form onSubmit={handleTeamSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Pays *</label>
            <select value={pays} onChange={e => setPays(e.target.value)} className="input-field">
              {countries.map(c => (
                <option key={c.code} value={c.code}>{c.flag} {c.label} ({c.dial})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Nom de l'equipe *</label>
            <input className="input-field" value={nomEquipe} onChange={e => setNomEquipe(e.target.value)} placeholder="Equipe Alpha" required />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Unite / Caserne *</label>
            <select value={unite} onChange={e => setUnite(e.target.value)} className="input-field">
              {unites.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Type de vehicule</label>
              <select value={typeVehicule} onChange={e => setTypeVehicule(e.target.value)} className="input-field text-sm">
                {vehiculeTypes.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Immatriculation</label>
              <input className="input-field" value={immatriculation} onChange={e => setImmatriculation(e.target.value)} placeholder="CI-1234-AB" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Email equipe *</label>
            <input type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)} placeholder="equipe@gspm.ci" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Telephone equipe *</label>
            <div className="flex gap-2">
              <div className="input-field w-24 flex items-center justify-center text-sm bg-gray-50 shrink-0 font-semibold">
                {countries.find(c => c.code === pays)?.flag} {countries.find(c => c.code === pays)?.dial}
              </div>
              <input type="tel" className="input-field flex-1" value={telephone} onChange={e => setTelephone(e.target.value)} placeholder="27 20 21 22 23" required />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 mt-2">
            <p className="text-xs font-bold text-gray-500 mb-3">CHEF D'EQUIPE</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Nom *</label>
                <input className="input-field" value={chefNom} onChange={e => setChefNom(e.target.value)} placeholder="Kouame" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Prenoms *</label>
                <input className="input-field" value={chefPrenoms} onChange={e => setChefPrenoms(e.target.value)} placeholder="Yao" required />
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-xs font-bold text-gray-500 mb-1">Grade</label>
              <select value={chefGrade} onChange={e => setChefGrade(e.target.value)} className="input-field">
                {grades.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <button type="submit" className="w-full py-3.5 bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl font-bold text-[15px] shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] mt-4">
            Continuer — Ajouter les membres
          </button>
        </form>
      </div>
    );
  }

  // ── STEP 2: Members ──
  if (step === 'members') {
    return (
      <div className="flex-1 overflow-y-auto p-5 fade-in">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => setStep('team')} className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg">←</button>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Membres de l'equipe</h2>
            <p className="text-xs text-gray-500">{nomEquipe} — {unite}</p>
          </div>
        </div>

        {/* Current members list */}
        <div className="mb-5">
          <p className="text-xs font-bold text-gray-500 mb-2">EQUIPE ({membres.length} membre{membres.length > 1 ? 's' : ''})</p>
          <div className="space-y-2">
            {membres.map((m, i) => (
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
        </div>

        {/* Add member form */}
        <div className="bg-blue-50/50 border-2 border-dashed border-blue-200 rounded-2xl p-4 mb-5">
          <p className="text-xs font-bold text-blue-600 mb-3">+ AJOUTER UN MEMBRE</p>
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
          <button type="button" onClick={addMember} disabled={!newNom || !newPrenoms}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-40">
            + Ajouter a l'equipe
          </button>
        </div>

        <button onClick={handleMembersSubmit}
          className="w-full py-3.5 bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-2xl font-bold text-[15px] shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]">
          Valider l'equipe ({membres.length} membres)
        </button>
      </div>
    );
  }

  // ── STEP 3: OTP Verification ──
  return (
    <div className="flex-1 flex flex-col p-6 fade-in">
      <h2 className="text-xl font-bold text-gray-900 mb-2 mt-8">Verification 2FA</h2>
      <p className="text-sm text-gray-500 mb-1">Code envoye par SMS au</p>
      <p className="text-sm font-bold text-gray-800 mb-6">🇨🇮 +225 {telephone}</p>

      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-5">
        <p className="text-xs font-bold text-emerald-600 mb-1">Recapitulatif</p>
        <p className="text-sm text-gray-800 font-semibold">{nomEquipe}</p>
        <p className="text-xs text-gray-500">{unite} — {membres.length} membres</p>
        <p className="text-xs text-gray-500">Chef: {chefGrade} {chefPrenoms} {chefNom}</p>
      </div>

      <div className="bg-amber-50 border border-amber-300 rounded-2xl px-4 py-2.5 mb-4 text-center">
        <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider mb-1">Mode Test — Code de verification</p>
        <p className="text-2xl font-mono font-extrabold text-amber-700 tracking-[0.3em]">{generatedOtp}</p>
      </div>
      <form onSubmit={handleVerify} className="flex-1 flex flex-col">
        <input type="text" className="input-field text-center text-3xl tracking-[0.5em] font-mono py-5 mb-6" value={otp} onChange={e => setOtp(e.target.value)} placeholder="000000" maxLength={6} autoFocus />
        <div className="flex-1" />
        <button type="submit" className="w-full py-3.5 bg-gradient-to-b from-blue-600 to-blue-700 text-white rounded-2xl font-bold text-[15px] shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]">
          Activer GERMS Pro
        </button>
        <button type="button" onClick={() => setStep('members')} className="text-sm text-gray-400 text-center mt-3">← Retour</button>
      </form>
    </div>
  );
}
