import { useState } from 'react';

interface LoginProps {
  onLogin: (user: any) => void;
}

const countries = [
  { code: 'FR', flag: '🇫🇷', dial: '+33', label: 'France' },
  { code: 'CI', flag: '🇨🇮', dial: '+225', label: "Cote d'Ivoire" },
  { code: 'US', flag: '🇺🇸', dial: '+1', label: 'USA' },
  { code: 'GB', flag: '🇬🇧', dial: '+44', label: 'UK' },
  { code: 'SN', flag: '🇸🇳', dial: '+221', label: 'Senegal' },
  { code: 'CM', flag: '🇨🇲', dial: '+237', label: 'Cameroun' },
  { code: 'MA', flag: '🇲🇦', dial: '+212', label: 'Maroc' },
];

const authMethods = [
  { key: 'sms', label: 'SMS', icon: '📱' },
  { key: 'whatsapp', label: 'WhatsApp', icon: '💬' },
  { key: 'email', label: 'Email', icon: '📧' },
  { key: 'authenticator', label: 'Auth App', icon: '🔐' },
];

const roles = [
  { key: 'OPERATEUR', label: 'Operateur', desc: 'Centre de commandement', icon: '🖥️' },
  { key: 'ADMIN', label: 'Administrateur', desc: 'Gestion complete', icon: '👑' },
  { key: 'POMPIER', label: 'Pompier / Secouriste', desc: 'Interventions terrain', icon: '🧑‍🚒' },
  { key: 'CITOYEN', label: 'Citoyen', desc: 'Alertes citoyennes', icon: '👤' },
];

type Step = 'login' | 'register' | '2fa' | 'register-2fa' | 'register-success';

export default function Login({ onLogin }: LoginProps) {
  const [step, setStep] = useState<Step>('login');
  const [loading, setLoading] = useState(false);

  // Login
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [authMethod, setAuthMethod] = useState('sms');
  const [otpCode, setOtpCode] = useState('');
  const [countryCode, setCountryCode] = useState('CI');

  // Register
  const [regNom, setRegNom] = useState('');
  const [regPrenoms, setRegPrenoms] = useState('');
  const [regTelephone, setRegTelephone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regCountry, setRegCountry] = useState('CI');
  const [regRole, setRegRole] = useState('OPERATEUR');
  const [regAuth, setRegAuth] = useState('sms');
  const [regOtp, setRegOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [loginOtp, setLoginOtp] = useState('');

  const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!telephone || !password) { window.alert('Veuillez remplir tous les champs'); return; }
    setLoading(true);
    const code = generateOtp();
    setLoginOtp(code);
    setTimeout(() => { setLoading(false); setStep('2fa'); }, 800);
  };

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode !== loginOtp) { window.alert('Code incorrect. Veuillez reessayer.'); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Use stored account if exists, otherwise default
      const stored = localStorage.getItem('germs_dashboard_accounts');
      const accounts = stored ? JSON.parse(stored) : [];
      const account = accounts.find((a: any) => a.telephone?.includes(telephone));
      if (account) {
        onLogin(account);
      } else {
        onLogin({ id: 'op1', nom: 'Konan', prenoms: 'J.', role: 'OPERATEUR', pays: countryCode, langue: 'fr' });
      }
    }, 600);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEmail) { window.alert('L\'email est obligatoire'); return; }
    if (regPassword !== regConfirm) { window.alert('Les mots de passe ne correspondent pas'); return; }
    setLoading(true);
    const code = generateOtp();
    setGeneratedOtp(code);
    setTimeout(() => { setLoading(false); setStep('register-2fa'); }, 800);
  };

  const handleRegisterVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (regOtp !== generatedOtp) { window.alert('Code incorrect. Veuillez reessayer.'); return; }
    setLoading(true);
    // Save account locally
    const account = { id: `user-${Date.now()}`, nom: regNom, prenoms: regPrenoms, telephone: `${regSelectedCountry.dial} ${regTelephone}`, email: regEmail, role: regRole, pays: regCountry, langue: 'fr' };
    const stored = localStorage.getItem('germs_dashboard_accounts');
    const accounts = stored ? JSON.parse(stored) : [];
    accounts.push(account);
    localStorage.setItem('germs_dashboard_accounts', JSON.stringify(accounts));
    setTimeout(() => { setLoading(false); setStep('register-success'); }, 600);
  };

  const handleGoToDashboard = () => {
    onLogin({ id: 'new-user', nom: regNom, prenoms: regPrenoms, role: regRole, pays: regCountry, langue: 'fr' });
  };

  const selectedCountry = countries.find(c => c.code === countryCode) || countries[0];
  const regSelectedCountry = countries.find(c => c.code === regCountry) || countries[0];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 40%, #0c4a6e 100%)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-red-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-500/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-3xl shadow-xl shadow-red-500/20">
            🚒
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">GERMS</h1>
          <p className="text-gray-500 text-[11px] mt-0.5">Global Emergency Response Management System</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl shadow-black/20 p-7 border border-white/10">

          {/* ══════════ LOGIN ══════════ */}
          {step === 'login' && (
            <form onSubmit={handleLogin}>
              <h2 className="text-lg font-bold text-gray-900 mb-5">Connexion</h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Telephone</label>
                <div className="flex gap-2">
                  <select value={countryCode} onChange={e => setCountryCode(e.target.value)} className="input-field w-28 text-sm">
                    {countries.map(c => <option key={c.code} value={c.code}>{c.flag} {c.dial}</option>)}
                  </select>
                  <input type="tel" className="input-field flex-1" value={telephone} onChange={e => setTelephone(e.target.value)} placeholder="6 12 34 56 78" />
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Mot de passe</label>
                <input type="password" className="input-field" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-600 mb-2">Canal 2FA</label>
                <div className="grid grid-cols-4 gap-2">
                  {authMethods.map(m => (
                    <button key={m.key} type="button" onClick={() => setAuthMethod(m.key)}
                      className={`p-2 rounded-xl border text-xs text-center transition-all ${authMethod === m.key ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold shadow-sm' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                      <div className="text-lg mb-0.5">{m.icon}</div>{m.label}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full bg-gradient-to-b from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white py-3.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-gray-900/20 active:scale-[0.98]" disabled={loading}>
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>

              <div className="mt-5 text-center">
                <p className="text-sm text-gray-400">Pas encore de compte ?</p>
                <button type="button" onClick={() => setStep('register')} className="text-sm text-blue-600 font-semibold hover:text-blue-700 mt-1 transition-colors">
                  Creer un compte
                </button>
              </div>
            </form>
          )}

          {/* ══════════ 2FA VERIFICATION (login) ══════════ */}
          {step === '2fa' && (
            <form onSubmit={handleVerify2FA}>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Verification 2FA</h2>
              <p className="text-sm text-gray-500 mb-5">
                Code envoye via <span className="font-semibold text-gray-800">{authMethods.find(m => m.key === authMethod)?.label}</span> au {selectedCountry.dial} {telephone}
              </p>
              <div className="bg-amber-50 border border-amber-300 rounded-xl px-4 py-2.5 mb-4 text-center">
                <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider mb-1">Mode Test — Code de verification</p>
                <p className="text-2xl font-mono font-extrabold text-amber-700 tracking-[0.3em]">{loginOtp}</p>
              </div>
              <div className="mb-5">
                <input type="text" className="input-field text-center text-3xl tracking-[0.5em] font-mono py-4" value={otpCode} onChange={e => setOtpCode(e.target.value)} placeholder="000000" maxLength={6} autoFocus />
              </div>
              <button type="submit" className="w-full bg-gradient-to-b from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white py-3.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-gray-900/20 active:scale-[0.98] mb-3" disabled={loading}>
                {loading ? 'Verification...' : 'Verifier'}
              </button>
              <div className="flex justify-between text-xs">
                <button type="button" onClick={() => setStep('login')} className="text-gray-400 hover:text-gray-600">← Retour</button>
                <button type="button" className="text-blue-600 hover:text-blue-700 font-medium">Renvoyer le code</button>
              </div>
            </form>
          )}

          {/* ══════════ REGISTER ══════════ */}
          {step === 'register' && (
            <form onSubmit={handleRegister}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900">Creer un compte</h2>
                <button type="button" onClick={() => setStep('login')} className="text-xs text-gray-400 hover:text-gray-600">← Connexion</button>
              </div>

              {/* Country + Role */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Pays</label>
                  <select value={regCountry} onChange={e => setRegCountry(e.target.value)} className="input-field text-sm">
                    {countries.map(c => <option key={c.code} value={c.code}>{c.flag} {c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
                  <select value={regRole} onChange={e => setRegRole(e.target.value)} className="input-field text-sm">
                    {roles.map(r => <option key={r.key} value={r.key}>{r.icon} {r.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Name */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Nom <span className="text-red-400">*</span></label>
                  <input type="text" className="input-field" value={regNom} onChange={e => setRegNom(e.target.value)} placeholder="Konan" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Prenoms <span className="text-red-400">*</span></label>
                  <input type="text" className="input-field" value={regPrenoms} onChange={e => setRegPrenoms(e.target.value)} placeholder="Yao Aristide" required />
                </div>
              </div>

              {/* Phone */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-500 mb-1">Telephone <span className="text-red-400">*</span></label>
                <div className="flex gap-2">
                  <div className="input-field w-20 flex items-center justify-center text-sm text-gray-500 bg-gray-50">
                    {regSelectedCountry.flag} {regSelectedCountry.dial}
                  </div>
                  <input type="tel" className="input-field flex-1" value={regTelephone} onChange={e => setRegTelephone(e.target.value)} placeholder="6 12 34 56 78" required />
                </div>
              </div>

              {/* Email */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-500 mb-1">Email <span className="text-red-400">*</span></label>
                <input type="email" className="input-field" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="operateur@germs.app" required />
              </div>

              {/* Password */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Mot de passe <span className="text-red-400">*</span></label>
                  <input type="password" className="input-field" value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Confirmer <span className="text-red-400">*</span></label>
                  <input type="password" className="input-field" value={regConfirm} onChange={e => setRegConfirm(e.target.value)} placeholder="••••••••" required />
                  {regConfirm && regPassword !== regConfirm && (
                    <p className="text-[10px] text-red-500 mt-0.5">Ne correspond pas</p>
                  )}
                </div>
              </div>

              {/* 2FA channel */}
              <div className="mb-5">
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Canal de verification 2FA</label>
                <div className="grid grid-cols-4 gap-2">
                  {authMethods.map(m => (
                    <button key={m.key} type="button" onClick={() => setRegAuth(m.key)}
                      className={`p-1.5 rounded-lg border text-[11px] text-center transition-all ${regAuth === m.key ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold' : 'border-gray-200 text-gray-400 hover:bg-gray-50'}`}>
                      <div className="text-base">{m.icon}</div>{m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-2.5 mb-5 cursor-pointer">
                <input type="checkbox" required className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-xs text-gray-500 leading-relaxed">
                  J'accepte les <span className="text-blue-600 font-medium">conditions d'utilisation</span> et la <span className="text-blue-600 font-medium">politique de confidentialite</span>
                </span>
              </label>

              <button type="submit" className="w-full bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]" disabled={loading}>
                {loading ? 'Creation du compte...' : 'Creer mon compte'}
              </button>

              <p className="text-center text-xs text-gray-400 mt-4">
                Deja un compte ? <button type="button" onClick={() => setStep('login')} className="text-blue-600 font-semibold hover:text-blue-700">Se connecter</button>
              </p>
            </form>
          )}

          {/* ══════════ 2FA VERIFICATION (register) ══════════ */}
          {step === 'register-2fa' && (
            <form onSubmit={handleRegisterVerify}>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Verification du compte</h2>
              <p className="text-sm text-gray-500 mb-1">
                Un code a ete envoye via <span className="font-semibold text-gray-800">{authMethods.find(m => m.key === regAuth)?.label}</span>
              </p>
              <p className="text-sm text-gray-500 mb-5">
                au <span className="font-semibold text-gray-800">{regSelectedCountry.dial} {regTelephone}</span>
              </p>
              <div className="bg-amber-50 border border-amber-300 rounded-xl px-4 py-2.5 mb-4 text-center">
                <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider mb-1">Mode Test — Code de verification</p>
                <p className="text-2xl font-mono font-extrabold text-amber-700 tracking-[0.3em]">{generatedOtp}</p>
              </div>
              <div className="mb-5">
                <input type="text" className="input-field text-center text-3xl tracking-[0.5em] font-mono py-4" value={regOtp} onChange={e => setRegOtp(e.target.value)} placeholder="000000" maxLength={6} autoFocus />
              </div>
              <button type="submit" className="w-full bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] mb-3" disabled={loading}>
                {loading ? 'Verification...' : 'Verifier le code'}
              </button>
              <div className="flex justify-between text-xs">
                <button type="button" onClick={() => setStep('register')} className="text-gray-400 hover:text-gray-600">← Retour</button>
                <button type="button" className="text-blue-600 hover:text-blue-700 font-medium">Renvoyer le code</button>
              </div>
            </form>
          )}

          {/* ══════════ REGISTER SUCCESS ══════════ */}
          {step === 'register-success' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 flex items-center justify-center text-3xl">
                ✅
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Compte cree avec succes !</h2>
              <p className="text-sm text-gray-500 mb-1">Bienvenue, <span className="font-semibold text-gray-800">{regPrenoms} {regNom}</span></p>
              <p className="text-xs text-gray-400 mb-6">
                Role : {roles.find(r => r.key === regRole)?.icon} {roles.find(r => r.key === regRole)?.label} — {regSelectedCountry.flag} {regSelectedCountry.label}
              </p>

              <div className="bg-gray-50 rounded-xl p-4 mb-5 text-left">
                <p className="text-xs font-semibold text-gray-600 mb-2">Recapitulatif</p>
                <div className="space-y-1 text-xs text-gray-500">
                  <p>👤 {regPrenoms} {regNom}</p>
                  <p>📱 {regSelectedCountry.dial} {regTelephone}</p>
                  {regEmail && <p>📧 {regEmail}</p>}
                  <p>🌍 {regSelectedCountry.label}</p>
                  <p>🔐 2FA via {authMethods.find(m => m.key === regAuth)?.label}</p>
                </div>
              </div>

              <button onClick={handleGoToDashboard} className="w-full bg-gradient-to-b from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white py-3.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-gray-900/20 active:scale-[0.98]">
                Acceder au Centre de Commandement
              </button>
            </div>
          )}

        </div>

        <p className="text-center text-gray-600 text-[10px] mt-4">GERMS v1.0 — Mode Developpement</p>
      </div>
    </div>
  );
}
