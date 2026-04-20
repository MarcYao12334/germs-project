import { useState, useEffect } from 'react';
import { storage } from '../lib/storage';
import { CitizenProfile } from '../types';

export default function Profile({ onLogout }: { onLogout: () => void }) {
  const [profile, setProfile] = useState<CitizenProfile | null>(null);

  useEffect(() => {
    setProfile(storage.getProfile());
    const interval = setInterval(() => setProfile(storage.getProfile()), 2000);
    return () => clearInterval(interval);
  }, []);

  if (!profile) return null;

  const full = Math.floor(profile.reputation);
  const half = profile.reputation % 1 >= 0.5;

  const infoItems = [
    {
      label: 'Telephone',
      value: profile.telephone,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.11h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.69a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      ),
    },
    {
      label: 'Email',
      value: profile.email || 'Non renseigne',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
    },
    {
      label: 'Pays',
      value: profile.pays,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      ),
    },
    {
      label: 'Inscrit le',
      value: new Date(profile.created_at).toLocaleDateString('fr-FR'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex-1 p-5 fade-in">
      {/* Avatar / Header */}
      <div className="flex flex-col items-center mt-6 mb-6">
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center mb-4 shadow-sahel relative"
          style={{ background: 'linear-gradient(135deg, #b45309 0%, #d97706 60%, #f59e0b 100%)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.90)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <h2 className="text-xl font-extrabold font-display text-stone-900">
          {profile.prenoms} {profile.nom}
        </h2>
        <p className="text-sm mt-0.5 font-body text-stone-400">
          Citoyen GERMS
        </p>
      </div>

      {/* Reputation */}
      <div
        className="rounded-2xl p-5 mb-5 text-center"
        style={{
          background: 'linear-gradient(135deg, #fef9f0 0%, #fef3c7 100%)',
          border: '1.5px solid rgba(180,83,9,0.16)',
          boxShadow: '0 2px 14px rgba(180,83,9,0.08)',
        }}
      >
        <p className="text-[11px] font-bold uppercase tracking-wider mb-2 font-body" style={{ color: '#b45309' }}>
          Score de reputation
        </p>
        <div className="flex items-center justify-center gap-1.5 mb-1">
          {Array.from({ length: 5 }, (_, i) => (
            <span
              key={i}
              className="text-2xl"
              style={{ color: i < full ? '#d97706' : (i === full && half ? '#fbbf24' : '#e7e5e4') }}
            >
              ★
            </span>
          ))}
        </div>
        <p className="text-2xl font-extrabold font-display text-stone-900">
          {profile.reputation.toFixed(1)}
          <span className="text-sm font-medium font-body text-stone-400">/5.0</span>
        </p>
      </div>

      {/* Info rows */}
      <div className="space-y-2.5 mb-8">
        {infoItems.map(item => (
          <div
            key={item.label}
            className="flex items-center gap-3 rounded-2xl px-4 py-3.5 bg-white"
            style={{ border: '1px solid #e7e5e4' }}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(180,83,9,0.08)' }}
            >
              {item.icon}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider font-body text-stone-400">
                {item.label}
              </p>
              <p className="text-sm font-medium font-body text-stone-900">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onLogout}
        className="w-full py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-[0.97] font-body"
        style={{
          color: '#dc2626',
          border: '1.5px solid rgba(220,38,38,0.25)',
          background: 'rgba(254,242,242,0.60)',
        }}
      >
        Deconnexion
      </button>
    </div>
  );
}
