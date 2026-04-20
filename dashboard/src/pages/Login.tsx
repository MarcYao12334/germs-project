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
  const [countryCode, setCountryCode] = useState('FR');

  // Register
  const [regNom, setRegNom] = useState('');
  const [regPrenoms, setRegPrenoms] = useState('');
  const [regTelephone, setRegTelephone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regCountry, setRegCountry] = useState('FR');
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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-command-950">
      {/* Background sahel glow orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-24 w-[480px] h-[480px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(180,83,9,0.13) 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/4 -right-24 w-[480px] h-[480px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(8,145,178,0.10) 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(180,83,9,0.05) 0%, transparent 60%)' }} />
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(to right, transparent, rgba(180,83,9,0.4), transparent)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(to right, transparent, rgba(8,145,178,0.25), transparent)' }} />
      </div>

      <div className="w-full max-w-md relative z-10 fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-3xl shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #b45309 0%, #d97706 50%, #0891b2 100%)',
              boxShadow: '0 0 40px rgba(180,83,9,0.35), 0 0 80px rgba(180,83,9,0.1)',
            }}
          >
            🚒
          </div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-command-100">GERMS</h1>
          <p className="font-body text-[11px] mt-1 tracking-widest uppercase text-command-600">Global Emergency Response Management System</p>
        </div>

        {/* Card */}
        <div className="card slide-up p-7" style={{
          boxShadow: '0 32px 64px rgba(2,6,23,0.7), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.05)',
          borderColor: 'rgba(180,83,9,0.2)',
        }}>

          {/* ══════════ LOGIN ══════════ */}
          {step === 'login' && (
            <form onSubmit={handleLogin}>
              <h2 className="font-display text-xl font-bold mb-1 text-command-100">Connexion</h2>
              <p className="font-body text-xs mb-6 text-command-500">Acces operateur — Centre de Commandement</p>

              <div className="mb-4">
                <label className="block font-body text-xs font-semibold mb-2 uppercase tracking-wider text-command-400">Telephone</label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={e => setCountryCode(e.target.value)}
                    className="input-field w-28 text-sm"
                  >
                    {countries.map(c => <option key={c.code} value={c.code}>{c.flag} {c.dial}</option>)}
                  </select>
                  <input
                    type="tel"
                    className="input-field flex-1"
                    value={telephone}
                    onChange={e => setTelephone(e.target.value)}
                    placeholder="6 12 34 56 78"
                  />
                </div>
              </div>

              <div className="mb-5">
                <label className="block font-body text-xs font-semibold mb-2 uppercase tracking-wider text-command-400">Mot de passe</label>
                <input
                  type="password"
                  className="input-field"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <div className="mb-6">
                <label className="block font-body text-xs font-semibold mb-2.5 uppercase tracking-wider text-command-400">Canal 2FA</label>
                <div className="grid grid-cols-4 gap-2">
                  {authMethods.map(m => (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setAuthMethod(m.key)}
                      className="p-2 rounded-xl text-xs text-center transition-all"
                      style={authMethod === m.key ? {
                        background: 'rgba(8,145,178,0.15)',
                        border: '1.5px solid rgba(8,145,178,0.6)',
                        color: '#22d3ee',
                        fontWeight: 700,
                      } : {
                        background: 'rgba(2,6,23,0.6)',
                        border: '1.5px solid rgba(148,163,184,0.1)',
                        color: '#475569',
                      }}
                    >
                      <div className="text-lg mb-0.5">{m.icon}</div>
                      <span className="font-body">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-body font-bold text-sm transition-all active:scale-[0.98] bg-gradient-to-r from-sahel-700 to-sahel-600 text-white shadow-sahel"
                style={{ letterSpacing: '0.03em', opacity: loading ? 0.6 : 1 }}
                disabled={loading}
              >
                {loading ? 'Connexion en cours...' : 'Se connecter'}
              </button>

              <div className="mt-6 text-center">
                <p className="font-body text-sm text-command-600">Pas encore de compte ?</p>
                <button
                  type="button"
                  onClick={() => setStep('register')}
                  className="font-body text-sm font-bold mt-1 text-accent-600 hover:text-accent-400 transition-colors"
                >
                  Creer un compte
                </button>
              </div>
            </form>
          )}

          {/* ══════════ 2FA VERIFICATION (login) ══════════ */}
          {step === '2fa' && (
            <form onSubmit={handleVerify2FA}>
              <h2 className="font-display text-xl font-bold mb-1 text-command-100">Verification 2FA</h2>
              <p className="font-body text-sm mb-5 text-command-500">
                Code envoye via{' '}
                <span className="font-semibold text-command-300">{authMethods.find(m => m.key === authMethod)?.label}</span>
                {' '}au {selectedCountry.dial} {telephone}
              </p>

              {/* Test mode OTP display */}
              <div
                className="rounded-xl px-4 py-3 mb-5 text-center"
                style={{
                  background: 'rgba(180,83,9,0.1)',
                  border: '1px solid rgba(180,83,9,0.35)',
                }}
              >
                <p className="font-body text-[10px] font-bold uppercase tracking-widest mb-1.5 text-sahel-600">Mode Test — Code de verification</p>
                <p className="font-mono text-2xl font-extrabold tracking-[0.35em] text-sahel-400">{loginOtp}</p>
              </div>

              <div className="mb-5">
                <input
                  type="text"
                  className="input-field text-center text-3xl tracking-[0.5em] font-mono py-4"
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-body font-bold text-sm transition-all active:scale-[0.98] mb-4 bg-gradient-to-r from-sahel-700 to-sahel-600 text-white shadow-sahel"
                style={{ opacity: loading ? 0.6 : 1 }}
                disabled={loading}
              >
                {loading ? 'Verification...' : 'Verifier le code'}
              </button>

              <div className="flex justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setStep('login')}
                  className="font-body text-command-600 hover:text-command-400 transition-colors"
                >
                  ← Retour
                </button>
                <button
                  type="button"
                  className="font-body font-semibold text-accent-600 hover:text-accent-400 transition-colors"
                >
                  Renvoyer le code
                </button>
              </div>
            </form>
          )}

          {/* ══════════ REGISTER ══════════ */}
          {step === 'register' && (
            <form onSubmit={handleRegister}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-display text-xl font-bold text-command-100">Creer un compte</h2>
                  <p className="font-body text-xs mt-0.5 text-command-500">Nouveau membre GERMS</p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('login')}
                  className="font-body text-xs text-command-600 hover:text-command-400 transition-colors"
                >
                  ← Connexion
                </button>
              </div>

              {/* Country + Role */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block font-body text-xs font-semibold mb-1.5 uppercase tracking-wider text-command-500">Pays</label>
                  <select value={regCountry} onChange={e => setRegCountry(e.target.value)} className="input-field text-sm">
                    {countries.map(c => <option key={c.code} value={c.code}>{c.flag} {c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-body text-xs font-semibold mb-1.5 uppercase tracking-wider text-command-500">Role</label>
                  <select value={regRole} onChange={e => setRegRole(e.target.value)} className="input-field text-sm">
                    {roles.map(r => <option key={r.key} value={r.key}>{r.icon} {r.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Name */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block font-body text-xs font-semibold mb-1.5 uppercase tracking-wider text-command-500">Nom <span className="text-red-500">*</span></label>
                  <input type="text" className="input-field" value={regNom} onChange={e => setRegNom(e.target.value)} placeholder="Konan" required />
                </div>
                <div>
                  <label className="block font-body text-xs font-semibold mb-1.5 uppercase tracking-wider text-command-500">Prenoms <span className="text-red-500">*</span></label>
                  <input type="text" className="input-field" value={regPrenoms} onChange={e => setRegPrenoms(e.target.value)} placeholder="Yao Aristide" required />
                </div>
              </div>

              {/* Phone */}
              <div className="mb-4">
                <label className="block font-body text-xs font-semibold mb-1.5 uppercase tracking-wider text-command-500">Telephone <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <div className="input-field w-24 flex items-center justify-center text-sm shrink-0 text-command-500">
                    {regSelectedCountry.flag} {regSelectedCountry.dial}
                  </div>
                  <input type="tel" className="input-field flex-1" value={regTelephone} onChange={e => setRegTelephone(e.target.value)} placeholder="6 12 34 56 78" required />
                </div>
              </div>

              {/* Email */}
              <div className="mb-4">
                <label className="block font-body text-xs font-semibold mb-1.5 uppercase tracking-wider text-command-500">Email <span className="text-red-500">*</span></label>
                <input type="email" className="input-field" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="operateur@germs.app" required />
              </div>

              {/* Password */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block font-body text-xs font-semibold mb-1.5 uppercase tracking-wider text-command-500">Mot de passe <span className="text-red-500">*</span></label>
                  <input type="password" className="input-field" value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
                </div>
                <div>
                  <label className="block font-body text-xs font-semibold mb-1.5 uppercase tracking-wider text-command-500">Confirmer <span className="text-red-500">*</span></label>
                  <input type="password" className="input-field" value={regConfirm} onChange={e => setRegConfirm(e.target.value)} placeholder="••••••••" required />
                  {regConfirm && regPassword !== regConfirm && (
                    <p className="font-body text-[10px] mt-1 text-red-500">Ne correspond pas</p>
                  )}
                </div>
              </div>

              {/* 2FA channel */}
              <div className="mb-5">
                <label className="block font-body text-xs font-semibold mb-2 uppercase tracking-wider text-command-500">Canal de verification 2FA</label>
                <div className="grid grid-cols-4 gap-2">
                  {authMethods.map(m => (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setRegAuth(m.key)}
                      className="p-1.5 rounded-lg text-[11px] text-center transition-all"
                      style={regAuth === m.key ? {
                        background: 'rgba(8,145,178,0.15)',
                        border: '1.5px solid rgba(8,145,178,0.6)',
                        color: '#22d3ee',
                        fontWeight: 700,
                      } : {
                        background: 'rgba(2,6,23,0.6)',
                        border: '1.5px solid rgba(148,163,184,0.1)',
                        color: '#475569',
                      }}
                    >
                      <div className="text-base">{m.icon}</div>
                      <span className="font-body">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-2.5 mb-5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  className="mt-0.5 rounded"
                  style={{ accentColor: '#0891b2' }}
                />
                <span className="font-body text-xs leading-relaxed text-command-600">
                  J'accepte les{' '}
                  <span className="font-semibold text-accent-600">conditions d'utilisation</span>
                  {' '}et la{' '}
                  <span className="font-semibold text-accent-600">politique de confidentialite</span>
                </span>
              </label>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-body font-bold text-sm transition-all active:scale-[0.98] bg-gradient-to-r from-sahel-700 to-sahel-600 text-white shadow-sahel"
                style={{ opacity: loading ? 0.6 : 1 }}
                disabled={loading}
              >
                {loading ? 'Creation du compte...' : 'Creer mon compte'}
              </button>

              <p className="font-body text-center text-xs mt-5 text-command-600">
                Deja un compte ?{' '}
                <button
                  type="button"
                  onClick={() => setStep('login')}
                  className="font-bold text-accent-600 hover:text-accent-400 transition-colors"
                >
                  Se connecter
                </button>
              </p>
            </form>
          )}

          {/* ══════════ 2FA VERIFICATION (register) ══════════ */}
          {step === 'register-2fa' && (
            <form onSubmit={handleRegisterVerify}>
              <h2 className="font-display text-xl font-bold mb-1 text-command-100">Verification du compte</h2>
              <p className="font-body text-sm mb-1 text-command-500">
                Un code a ete envoye via{' '}
                <span className="font-semibold text-command-300">{authMethods.find(m => m.key === regAuth)?.label}</span>
              </p>
              <p className="font-body text-sm mb-5 text-command-500">
                au{' '}
                <span className="font-semibold text-command-300">{regSelectedCountry.dial} {regTelephone}</span>
              </p>

              <div
                className="rounded-xl px-4 py-3 mb-5 text-center"
                style={{
                  background: 'rgba(180,83,9,0.1)',
                  border: '1px solid rgba(180,83,9,0.35)',
                }}
              >
                <p className="font-body text-[10px] font-bold uppercase tracking-widest mb-1.5 text-sahel-600">Mode Test — Code de verification</p>
                <p className="font-mono text-2xl font-extrabold tracking-[0.35em] text-sahel-400">{generatedOtp}</p>
              </div>

              <div className="mb-5">
                <input
                  type="text"
                  className="input-field text-center text-3xl tracking-[0.5em] font-mono py-4"
                  value={regOtp}
                  onChange={e => setRegOtp(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-body font-bold text-sm transition-all active:scale-[0.98] mb-4 bg-gradient-to-r from-sahel-700 to-sahel-600 text-white shadow-sahel"
                style={{ opacity: loading ? 0.6 : 1 }}
                disabled={loading}
              >
                {loading ? 'Verification...' : 'Verifier le code'}
              </button>

              <div className="flex justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setStep('register')}
                  className="font-body text-command-600 hover:text-command-400 transition-colors"
                >
                  ← Retour
                </button>
                <button
                  type="button"
                  className="font-body font-semibold text-accent-600 hover:text-accent-400 transition-colors"
                >
                  Renvoyer le code
                </button>
              </div>
            </form>
          )}

          {/* ══════════ REGISTER SUCCESS ══════════ */}
          {step === 'register-success' && (
            <div className="text-center py-4">
              <div
                className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center text-3xl"
                style={{
                  background: 'rgba(16,185,129,0.12)',
                  border: '1px solid rgba(16,185,129,0.3)',
                  boxShadow: '0 0 32px rgba(16,185,129,0.15)',
                }}
              >
                ✅
              </div>
              <h2 className="font-display text-xl font-bold mb-1 text-command-100">Compte cree avec succes !</h2>
              <p className="font-body text-sm mb-1 text-command-500">
                Bienvenue,{' '}
                <span className="font-semibold text-command-300">{regPrenoms} {regNom}</span>
              </p>
              <p className="font-body text-xs mb-6 text-command-600">
                Role : {roles.find(r => r.key === regRole)?.icon} {roles.find(r => r.key === regRole)?.label} — {regSelectedCountry.flag} {regSelectedCountry.label}
              </p>

              <div
                className="rounded-xl p-4 mb-5 text-left"
                style={{
                  background: 'rgba(2,6,23,0.7)',
                  border: '1px solid rgba(148,163,184,0.07)',
                }}
              >
                <p className="font-body text-xs font-bold mb-3 uppercase tracking-wider text-command-600">Recapitulatif</p>
                <div className="space-y-1.5 text-xs font-body text-command-500">
                  <p>👤 {regPrenoms} {regNom}</p>
                  <p>📱 {regSelectedCountry.dial} {regTelephone}</p>
                  {regEmail && <p>📧 {regEmail}</p>}
                  <p>🌍 {regSelectedCountry.label}</p>
                  <p>🔐 2FA via {authMethods.find(m => m.key === regAuth)?.label}</p>
                </div>
              </div>

              <button
                onClick={handleGoToDashboard}
                className="w-full py-3.5 rounded-xl font-body font-bold text-sm transition-all active:scale-[0.98] bg-gradient-to-r from-sahel-700 to-sahel-600 text-white shadow-sahel"
                style={{ letterSpacing: '0.03em' }}
              >
                Acceder au Centre de Commandement
              </button>
            </div>
          )}

        </div>

        <p className="font-body text-center text-[10px] mt-5 tracking-wider uppercase text-command-700">GERMS v1.0 — Mode Developpement</p>
      </div>
    </div>
  );
}
