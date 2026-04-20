import { useState } from 'react';
import { storage } from '../lib/storage';

const countries = [
  { code: 'CI', flag: '🇨🇮', label: "Cote d'Ivoire", lang: 'Francais' },
  { code: 'FR', flag: '🇫🇷', label: 'France', lang: 'Francais' },
  { code: 'SN', flag: '🇸🇳', label: 'Senegal', lang: 'Francais' },
  { code: 'CM', flag: '🇨🇲', label: 'Cameroun', lang: 'Francais' },
  { code: 'MA', flag: '🇲🇦', label: 'Maroc', lang: 'Francais' },
  { code: 'US', flag: '🇺🇸', label: 'United States', lang: 'English' },
  { code: 'GB', flag: '🇬🇧', label: 'United Kingdom', lang: 'English' },
];

export default function Onboarding({ onDone }: { onDone: (country: string) => void }) {
  const [selected, setSelected] = useState('CI');

  return (
    <div className="flex-1 flex flex-col p-6 fade-in" style={{ minHeight: '100%' }}>
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Logo area */}
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6 slide-up shadow-sahel"
          style={{ background: 'linear-gradient(135deg, #b45309 0%, #d97706 50%, #f59e0b 100%)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        </div>

        <h1
          className="text-3xl font-extrabold mb-1 slide-up font-display text-stone-900"
          style={{ animationDelay: '60ms' }}
        >
          GERMS Alert
        </h1>
        <p
          className="text-sm mb-8 slide-up font-body text-stone-400"
          style={{ animationDelay: '100ms' }}
        >
          Signalement citoyen d'urgence
        </p>

        {/* Divider */}
        <div
          className="w-12 h-0.5 mb-7 rounded-full"
          style={{ background: 'linear-gradient(90deg, transparent, #d97706, transparent)' }}
        />

        <p className="text-sm font-semibold mb-3 self-start font-body text-stone-600">
          Selectionnez votre pays
        </p>

        <div className="w-full space-y-2 mb-8">
          {countries.map((c, idx) => {
            const isSelected = selected === c.code;
            return (
              <button
                key={c.code}
                onClick={() => setSelected(c.code)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all active:scale-[0.97] slide-up"
                style={{
                  border: isSelected ? '1.5px solid #b45309' : '1.5px solid #e7e5e4',
                  background: isSelected
                    ? 'linear-gradient(135deg, #fef9f0 0%, #fef3c7 100%)'
                    : 'rgba(255,255,255,0.65)',
                  boxShadow: isSelected ? '0 2px 12px rgba(180,83,9,0.12)' : 'none',
                  animationDelay: `${idx * 40 + 120}ms`,
                }}
              >
                <span className="text-2xl">{c.flag}</span>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-sm font-body text-stone-900">{c.label}</p>
                  <p className="text-xs font-body text-stone-400">{c.lang}</p>
                </div>
                {isSelected && (
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: '#b45309' }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={() => { storage.setOnboarded(); onDone(selected); }}
        className="w-full py-4 rounded-xl font-bold text-white text-[15px] transition-all active:scale-[0.97] hover:-translate-y-px font-body bg-gradient-to-r from-sahel-700 to-sahel-600 shadow-sahel"
      >
        Continuer
      </button>
    </div>
  );
}
