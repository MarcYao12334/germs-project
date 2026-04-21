import { useState } from 'react';
import { storage } from '../lib/storage';
import { CitizenProfile } from '../types';

const countriesData = [
  { code: 'CI', flag: '🇨🇮', dial: '+225', label: "Cote d'Ivoire", placeholder: '07 08 09 10 11' },
  { code: 'SN', flag: '🇸🇳', dial: '+221', label: 'Senegal', placeholder: '77 123 45 67' },
  { code: 'ML', flag: '🇲🇱', dial: '+223', label: 'Mali', placeholder: '70 12 34 56' },
  { code: 'BF', flag: '🇧🇫', dial: '+226', label: 'Burkina Faso', placeholder: '70 12 34 56' },
  { code: 'GN', flag: '🇬🇳', dial: '+224', label: 'Guinee', placeholder: '621 12 34 56' },
  { code: 'TG', flag: '🇹🇬', dial: '+228', label: 'Togo', placeholder: '90 12 34 56' },
  { code: 'BJ', flag: '🇧🇯', dial: '+229', label: 'Benin', placeholder: '97 12 34 56' },
  { code: 'NE', flag: '🇳🇪', dial: '+227', label: 'Niger', placeholder: '90 12 34 56' },
  { code: 'MR', flag: '🇲🇷', dial: '+222', label: 'Mauritanie', placeholder: '36 12 34 56' },
  { code: 'CM', flag: '🇨🇲', dial: '+237', label: 'Cameroun', placeholder: '6 70 12 34 56' },
  { code: 'GA', flag: '🇬🇦', dial: '+241', label: 'Gabon', placeholder: '07 12 34 56' },
  { code: 'CG', flag: '🇨🇬', dial: '+242', label: 'Congo-Brazzaville', placeholder: '06 612 3456' },
  { code: 'CD', flag: '🇨🇩', dial: '+243', label: 'RD Congo', placeholder: '81 234 5678' },
  { code: 'TD', flag: '🇹🇩', dial: '+235', label: 'Tchad', placeholder: '66 12 34 56' },
  { code: 'CF', flag: '🇨🇫', dial: '+236', label: 'Centrafrique', placeholder: '70 12 34 56' },
  { code: 'GQ', flag: '🇬🇶', dial: '+240', label: 'Guinee Equatoriale', placeholder: '222 12 34 56' },
  { code: 'MA', flag: '🇲🇦', dial: '+212', label: 'Maroc', placeholder: '6 12 34 56 78' },
  { code: 'DZ', flag: '🇩🇿', dial: '+213', label: 'Algerie', placeholder: '5 12 34 56 78' },
  { code: 'TN', flag: '🇹🇳', dial: '+216', label: 'Tunisie', placeholder: '20 123 456' },
  { code: 'MG', flag: '🇲🇬', dial: '+261', label: 'Madagascar', placeholder: '32 12 345 67' },
  { code: 'KM', flag: '🇰🇲', dial: '+269', label: 'Comores', placeholder: '321 23 45' },
  { code: 'DJ', flag: '🇩🇯', dial: '+253', label: 'Djibouti', placeholder: '77 12 34 56' },
  { code: 'BI', flag: '🇧🇮', dial: '+257', label: 'Burundi', placeholder: '79 12 34 56' },
  { code: 'RW', flag: '🇷🇼', dial: '+250', label: 'Rwanda', placeholder: '78 123 4567' },
  { code: 'FR', flag: '🇫🇷', dial: '+33', label: 'France', placeholder: '6 12 34 56 78' },
  { code: 'BE', flag: '🇧🇪', dial: '+32', label: 'Belgique', placeholder: '470 12 34 56' },
  { code: 'CH', flag: '🇨🇭', dial: '+41', label: 'Suisse', placeholder: '79 123 45 67' },
  { code: 'CA', flag: '🇨🇦', dial: '+1', label: 'Canada', placeholder: '514 555 0123' },
];

interface Props { onDone: () => void; initialCountry?: string; }

export default function Register({ onDone, initialCountry = 'CI' }: Props) {
  const [nom, setNom] = useState('');
  const [prenoms, setPrenoms] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [pays, setPays] = useState(initialCountry);
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [otp, setOtp] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

  const country = countriesData.find(c => c.code === pays) || countriesData[0];

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!nom.trim()) errs.nom = 'Le nom est obligatoire';
    else if (nom.trim().length < 2) errs.nom = 'Le nom doit contenir au moins 2 caracteres';
    if (!prenoms.trim()) errs.prenoms = 'Le(s) prenom(s) est obligatoire';
    else if (prenoms.trim().length < 2) errs.prenoms = 'Le prenom doit contenir au moins 2 caracteres';
    if (!telephone.trim()) errs.telephone = 'Le telephone est obligatoire';
    else if (telephone.replace(/\s/g, '').length < 8) errs.telephone = 'Numero de telephone invalide (min 8 chiffres)';
    if (!email.trim()) errs.email = "L'email est obligatoire";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Adresse email invalide';
    if (!password) errs.password = 'Le mot de passe est obligatoire';
    else if (password.length < 6) errs.password = 'Le mot de passe doit contenir au moins 6 caracteres';
    if (!confirm) errs.confirm = 'Veuillez confirmer le mot de passe';
    else if (password !== confirm) errs.confirm = 'Les mots de passe ne correspondent pas';
    if (!accepted) errs.accepted = 'Vous devez accepter les conditions';
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const code = generateOtp();
    setGeneratedOtp(code);
    setStep('otp');
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== generatedOtp) { window.alert('Code incorrect. Veuillez reessayer.'); return; }
    const profile: CitizenProfile = {
      id: `cit-${Date.now()}`, nom, prenoms,
      telephone: `${country.dial} ${telephone}`,
      email: email || undefined, pays, langue: 'fr',
      reputation: 3.0, created_at: new Date().toISOString(),
    };
    storage.saveProfile(profile);
    onDone();
  };

  if (step === 'otp') {
    return (
      <div className="flex-1 flex flex-col p-6 fade-in">
        <h2 className="text-xl font-bold text-gray-900 mb-2 mt-8">Verification</h2>
        <p className="text-sm text-gray-500 mb-1">Code envoye par SMS au</p>
        <p className="text-sm font-bold text-gray-800 mb-6">{country.flag} {country.dial} {telephone}</p>
        <div className="bg-amber-50 border border-amber-300 rounded-2xl px-4 py-2.5 mb-4 text-center">
          <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider mb-1">Mode Test — Code de verification</p>
          <p className="text-2xl font-mono font-extrabold text-amber-700 tracking-[0.3em]">{generatedOtp}</p>
        </div>
        <form onSubmit={handleVerify} className="flex-1 flex flex-col">
          <input type="text" className="input-field text-center text-3xl tracking-[0.5em] font-mono py-5 mb-6" value={otp} onChange={e => setOtp(e.target.value)} placeholder="000000" maxLength={6} autoFocus />
          <div className="flex-1" />
          <button type="submit" className="btn-primary">Verifier</button>
          <button type="button" onClick={() => setStep('form')} className="text-sm text-gray-400 text-center mt-3">← Retour</button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 fade-in">
      <div className="text-center mb-6 mt-4">
        <div className="text-4xl mb-2">👤</div>
        <h2 className="text-xl font-bold text-gray-900">Creer mon compte</h2>
        <p className="text-sm text-gray-500">GERMS Alert — {country.flag} {country.label}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Pays */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Pays / Region *</label>
          <div className="relative">
            <select value={pays} onChange={e => setPays(e.target.value)}
              className="input-field appearance-none pr-10 text-[15px] font-medium cursor-pointer">
              {countriesData.map(c => (
                <option key={c.code} value={c.code}>{c.flag}  {c.label} ({c.dial})</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-sm">▼</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Nom *</label>
            <input className={`input-field ${errors.nom ? '!border-red-400 !bg-red-50/30' : ''}`} value={nom} onChange={e => { setNom(e.target.value); setErrors(prev => { const n = {...prev}; delete n.nom; return n; }); }} placeholder="Konan" required />
            {errors.nom && <p className="text-[11px] text-red-500 mt-1">{errors.nom}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Prenoms *</label>
            <input className={`input-field ${errors.prenoms ? '!border-red-400 !bg-red-50/30' : ''}`} value={prenoms} onChange={e => { setPrenoms(e.target.value); setErrors(prev => { const n = {...prev}; delete n.prenoms; return n; }); }} placeholder="Yao Aristide" required />
            {errors.prenoms && <p className="text-[11px] text-red-500 mt-1">{errors.prenoms}</p>}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Telephone *</label>
          <div className="flex gap-2">
            <div className="relative shrink-0">
              <select value={pays} onChange={e => setPays(e.target.value)}
                className="input-field w-[110px] appearance-none pr-7 text-sm font-semibold cursor-pointer bg-gray-50">
                {countriesData.map(c => (
                  <option key={c.code} value={c.code}>{c.flag} {c.dial}</option>
                ))}
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-[10px]">▼</div>
            </div>
            <input type="tel" className={`input-field flex-1 ${errors.telephone ? '!border-red-400 !bg-red-50/30' : ''}`} value={telephone} onChange={e => { setTelephone(e.target.value); setErrors(prev => { const n = {...prev}; delete n.telephone; return n; }); }} placeholder={country.placeholder} required />
          </div>
          {errors.telephone && <p className="text-[11px] text-red-500 mt-1">{errors.telephone}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Email <span className="text-red-400">*</span></label>
          <input type="email" className={`input-field ${errors.email ? '!border-red-400 !bg-red-50/30' : ''}`} value={email} onChange={e => { setEmail(e.target.value); setErrors(prev => { const n = {...prev}; delete n.email; return n; }); }} placeholder="konan@email.com" required />
          {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Mot de passe *</label>
            <input type="password" className={`input-field ${errors.password ? '!border-red-400 !bg-red-50/30' : ''}`} value={password} onChange={e => { setPassword(e.target.value); setErrors(prev => { const n = {...prev}; delete n.password; return n; }); }} required minLength={6} />
            {errors.password && <p className="text-[11px] text-red-500 mt-1">{errors.password}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Confirmer *</label>
            <input type="password" className={`input-field ${errors.confirm ? '!border-red-400 !bg-red-50/30' : ''}`} value={confirm} onChange={e => { setConfirm(e.target.value); setErrors(prev => { const n = {...prev}; delete n.confirm; return n; }); }} required />
            {errors.confirm && <p className="text-[11px] text-red-500 mt-1">{errors.confirm}</p>}
          </div>
        </div>

        <div>
          <label className="flex items-start gap-2.5 pt-2 cursor-pointer">
            <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} className="mt-0.5 rounded border-gray-300 text-red-600" required />
            <span className="text-xs text-gray-500">J'accepte les <span className="text-red-600 font-medium">conditions d'utilisation</span></span>
          </label>
          {errors.accepted && <p className="text-[11px] text-red-500 mt-1">{errors.accepted}</p>}
        </div>

        <button type="submit" className="btn-primary mt-2">Creer mon compte</button>
      </form>
    </div>
  );
}
