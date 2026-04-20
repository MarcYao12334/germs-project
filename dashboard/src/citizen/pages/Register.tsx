import { useState } from 'react';
import { storage } from '../lib/storage';
import { CitizenProfile } from '../types';

const countriesData = [
  { code: 'CI', flag: '🇨🇮', dial: '+225', label: "Cote d'Ivoire", placeholder: '07 08 09 10 11' },
  { code: 'FR', flag: '🇫🇷', dial: '+33', label: 'France', placeholder: '6 12 34 56 78' },
  { code: 'SN', flag: '🇸🇳', dial: '+221', label: 'Senegal', placeholder: '77 123 45 67' },
  { code: 'CM', flag: '🇨🇲', dial: '+237', label: 'Cameroun', placeholder: '6 70 12 34 56' },
  { code: 'MA', flag: '🇲🇦', dial: '+212', label: 'Maroc', placeholder: '6 12 34 56 78' },
  { code: 'US', flag: '🇺🇸', dial: '+1', label: 'Etats-Unis', placeholder: '202 555 0123' },
  { code: 'GB', flag: '🇬🇧', dial: '+44', label: 'Royaume-Uni', placeholder: '7911 123456' },
  { code: 'ML', flag: '🇲🇱', dial: '+223', label: 'Mali', placeholder: '70 12 34 56' },
  { code: 'BF', flag: '🇧🇫', dial: '+226', label: 'Burkina Faso', placeholder: '70 12 34 56' },
  { code: 'GN', flag: '🇬🇳', dial: '+224', label: 'Guinee', placeholder: '621 12 34 56' },
  { code: 'TG', flag: '🇹🇬', dial: '+228', label: 'Togo', placeholder: '90 12 34 56' },
  { code: 'BJ', flag: '🇧🇯', dial: '+229', label: 'Benin', placeholder: '97 12 34 56' },
  { code: 'NE', flag: '🇳🇪', dial: '+227', label: 'Niger', placeholder: '90 12 34 56' },
  { code: 'GA', flag: '🇬🇦', dial: '+241', label: 'Gabon', placeholder: '07 12 34 56' },
  { code: 'CD', flag: '🇨🇩', dial: '+243', label: 'RD Congo', placeholder: '81 234 5678' },
  { code: 'CG', flag: '🇨🇬', dial: '+242', label: 'Congo', placeholder: '06 612 3456' },
  { code: 'MG', flag: '🇲🇬', dial: '+261', label: 'Madagascar', placeholder: '32 12 345 67' },
  { code: 'DZ', flag: '🇩🇿', dial: '+213', label: 'Algerie', placeholder: '5 12 34 56 78' },
  { code: 'TN', flag: '🇹🇳', dial: '+216', label: 'Tunisie', placeholder: '20 123 456' },
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
  const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

  const country = countriesData.find(c => c.code === pays) || countriesData[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { window.alert('L\'email est obligatoire'); return; }
    if (password !== confirm) { window.alert('Les mots de passe ne correspondent pas'); return; }
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

  const labelClass = 'block text-[11px] font-bold uppercase tracking-[0.06em] font-body text-stone-500 mb-1.5';

  if (step === 'otp') {
    return (
      <div className="flex-1 flex flex-col p-6 fade-in">
        <div className="mt-8 mb-6">
          <h2 className="text-xl font-bold mb-1 font-display text-stone-900">
            Verification
          </h2>
          <p className="text-sm font-body text-stone-400">
            Code envoye par SMS au
          </p>
          <p className="text-sm font-bold mt-0.5 font-body text-stone-900">
            {country.flag} {country.dial} {telephone}
          </p>
        </div>

        <div
          className="rounded-2xl px-4 py-3 mb-5 text-center"
          style={{
            background: 'linear-gradient(135deg, #fef9f0 0%, #fef3c7 100%)',
            border: '1.5px solid rgba(180,83,9,0.20)',
          }}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5 font-body" style={{ color: '#b45309' }}>
            Mode Test — Code de verification
          </p>
          <p className="text-2xl font-extrabold tracking-[0.3em] font-mono" style={{ color: '#92400e' }}>
            {generatedOtp}
          </p>
        </div>

        <form onSubmit={handleVerify} className="flex-1 flex flex-col">
          <input
            type="text"
            className="input-light text-center text-3xl tracking-[0.5em] py-5 mb-6 font-mono"
            value={otp}
            onChange={e => setOtp(e.target.value)}
            placeholder="000000"
            maxLength={6}
            autoFocus
          />
          <div className="flex-1" />
          <button
            type="submit"
            className="w-full py-4 rounded-xl font-bold text-white text-[15px] transition-all active:scale-[0.97] font-body bg-gradient-to-r from-sahel-700 to-sahel-600 shadow-sahel"
          >
            Verifier
          </button>
          <button
            type="button"
            onClick={() => setStep('form')}
            className="text-sm text-center mt-3 transition-colors hover:opacity-70 font-body text-stone-400"
          >
            ← Retour
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 fade-in">
      {/* Header */}
      <div className="text-center mb-7 mt-4">
        <div
          className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-sahel"
          style={{ background: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <h2 className="text-xl font-bold font-display text-stone-900">
          Creer mon compte
        </h2>
        <p className="text-sm mt-0.5 font-body text-stone-400">
          GERMS Alert — {country.flag} {country.label}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Pays */}
        <div>
          <label className={labelClass}>Pays / Region *</label>
          <div className="relative">
            <select
              value={pays}
              onChange={e => setPays(e.target.value)}
              className="input-light appearance-none pr-10 text-[15px] font-medium cursor-pointer font-body"
            >
              {countriesData.map(c => (
                <option key={c.code} value={c.code}>{c.flag}  {c.label} ({c.dial})</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-sm text-stone-400">▼</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Nom *</label>
            <input className="input-light font-body" value={nom} onChange={e => setNom(e.target.value)} placeholder="Konan" required />
          </div>
          <div>
            <label className={labelClass}>Prenoms *</label>
            <input className="input-light font-body" value={prenoms} onChange={e => setPrenoms(e.target.value)} placeholder="Yao Aristide" required />
          </div>
        </div>

        <div>
          <label className={labelClass}>Telephone *</label>
          <div className="flex gap-2">
            <div className="relative shrink-0">
              <select
                value={pays}
                onChange={e => setPays(e.target.value)}
                className="input-light w-[110px] appearance-none pr-7 text-sm font-semibold cursor-pointer font-body"
              >
                {countriesData.map(c => (
                  <option key={c.code} value={c.code}>{c.flag} {c.dial}</option>
                ))}
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] text-stone-400">▼</div>
            </div>
            <input
              type="tel"
              className="input-light flex-1 font-body"
              value={telephone}
              onChange={e => setTelephone(e.target.value)}
              placeholder={country.placeholder}
              required
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>
            Email <span style={{ color: '#b45309' }}>*</span>
          </label>
          <input
            type="email"
            className="input-light font-body"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="konan@email.com"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Mot de passe *</label>
            <input
              type="password"
              className="input-light font-body"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div>
            <label className={labelClass}>Confirmer *</label>
            <input
              type="password"
              className="input-light font-body"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
            />
            {confirm && password !== confirm && (
              <p className="text-[10px] mt-0.5 font-body" style={{ color: '#ef4444' }}>
                Ne correspond pas
              </p>
            )}
          </div>
        </div>

        <label className="flex items-start gap-2.5 pt-2 cursor-pointer">
          <input
            type="checkbox"
            checked={accepted}
            onChange={e => setAccepted(e.target.checked)}
            className="mt-0.5 rounded border-stone-300"
            required
          />
          <span className="text-xs font-body text-stone-500">
            J'accepte les{' '}
            <span className="font-semibold" style={{ color: '#b45309' }}>conditions d'utilisation</span>
          </span>
        </label>

        <button
          type="submit"
          className="w-full py-4 rounded-xl font-bold text-white text-[15px] transition-all active:scale-[0.97] mt-2 font-body bg-gradient-to-r from-sahel-700 to-sahel-600 shadow-sahel"
        >
          Creer mon compte
        </button>
      </form>
    </div>
  );
}
