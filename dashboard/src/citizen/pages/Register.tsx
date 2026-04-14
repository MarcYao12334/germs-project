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

  const country = countriesData.find(c => c.code === pays) || countriesData[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { window.alert('Les mots de passe ne correspondent pas'); return; }
    setStep('otp');
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
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
            <input className="input-field" value={nom} onChange={e => setNom(e.target.value)} placeholder="Konan" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Prenoms *</label>
            <input className="input-field" value={prenoms} onChange={e => setPrenoms(e.target.value)} placeholder="Yao Aristide" required />
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
            <input type="tel" className="input-field flex-1" value={telephone} onChange={e => setTelephone(e.target.value)} placeholder={country.placeholder} required />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Email <span className="text-gray-300">(optionnel)</span></label>
          <input type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)} placeholder="konan@email.com" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Mot de passe *</label>
            <input type="password" className="input-field" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Confirmer *</label>
            <input type="password" className="input-field" value={confirm} onChange={e => setConfirm(e.target.value)} required />
            {confirm && password !== confirm && <p className="text-[10px] text-red-500 mt-0.5">Ne correspond pas</p>}
          </div>
        </div>

        <label className="flex items-start gap-2.5 pt-2 cursor-pointer">
          <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} className="mt-0.5 rounded border-gray-300 text-red-600" required />
          <span className="text-xs text-gray-500">J'accepte les <span className="text-red-600 font-medium">conditions d'utilisation</span></span>
        </label>

        <button type="submit" className="btn-primary mt-2">Creer mon compte</button>
      </form>
    </div>
  );
}
