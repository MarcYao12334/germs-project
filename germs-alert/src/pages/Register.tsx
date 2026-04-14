import { useState } from 'react';
import { storage } from '../lib/storage';
import { CitizenProfile } from '../types';

const countriesData = [
  { code: 'CI', flag: '🇨🇮', dial: '+225', label: "Cote d'Ivoire", placeholder: '07 08 09 10 11' },
  { code: 'FR', flag: '🇫🇷', dial: '+33', label: 'France', placeholder: '6 12 34 56 78' },
  { code: 'SN', flag: '🇸🇳', dial: '+221', label: 'Senegal', placeholder: '77 123 45 67' },
  { code: 'CM', flag: '🇨🇲', dial: '+237', label: 'Cameroun', placeholder: '6 70 12 34 56' },
  { code: 'MA', flag: '🇲🇦', dial: '+212', label: 'Maroc', placeholder: '6 12 34 56 78' },
  { code: 'US', flag: '🇺🇸', dial: '+1', label: 'USA', placeholder: '202 555 0123' },
  { code: 'GB', flag: '🇬🇧', dial: '+44', label: 'UK', placeholder: '7911 123456' },
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
          <label className="block text-xs font-semibold text-gray-500 mb-1">Pays</label>
          <select value={pays} onChange={e => setPays(e.target.value)} className="input-field">
            {countriesData.map(c => <option key={c.code} value={c.code}>{c.flag} {c.label} ({c.dial})</option>)}
          </select>
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
            <div className="input-field w-24 flex items-center justify-center text-sm bg-gray-50 shrink-0 font-semibold">
              {country.flag} {country.dial}
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
