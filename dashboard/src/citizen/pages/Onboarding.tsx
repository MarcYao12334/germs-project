import { useState } from 'react';
import { storage } from '../lib/storage';

const countries = [
  { code: 'CI', flag: '🇨🇮', label: "Cote d'Ivoire", lang: 'Francais' },
  { code: 'SN', flag: '🇸🇳', label: 'Senegal', lang: 'Francais' },
  { code: 'ML', flag: '🇲🇱', label: 'Mali', lang: 'Francais' },
  { code: 'BF', flag: '🇧🇫', label: 'Burkina Faso', lang: 'Francais' },
  { code: 'GN', flag: '🇬🇳', label: 'Guinee', lang: 'Francais' },
  { code: 'TG', flag: '🇹🇬', label: 'Togo', lang: 'Francais' },
  { code: 'BJ', flag: '🇧🇯', label: 'Benin', lang: 'Francais' },
  { code: 'NE', flag: '🇳🇪', label: 'Niger', lang: 'Francais' },
  { code: 'MR', flag: '🇲🇷', label: 'Mauritanie', lang: 'Francais' },
  { code: 'CM', flag: '🇨🇲', label: 'Cameroun', lang: 'Francais' },
  { code: 'GA', flag: '🇬🇦', label: 'Gabon', lang: 'Francais' },
  { code: 'CG', flag: '🇨🇬', label: 'Congo-Brazzaville', lang: 'Francais' },
  { code: 'CD', flag: '🇨🇩', label: 'RD Congo', lang: 'Francais' },
  { code: 'TD', flag: '🇹🇩', label: 'Tchad', lang: 'Francais' },
  { code: 'CF', flag: '🇨🇫', label: 'Centrafrique', lang: 'Francais' },
  { code: 'GQ', flag: '🇬🇶', label: 'Guinee Equatoriale', lang: 'Francais' },
  { code: 'MA', flag: '🇲🇦', label: 'Maroc', lang: 'Francais' },
  { code: 'DZ', flag: '🇩🇿', label: 'Algerie', lang: 'Francais' },
  { code: 'TN', flag: '🇹🇳', label: 'Tunisie', lang: 'Francais' },
  { code: 'MG', flag: '🇲🇬', label: 'Madagascar', lang: 'Francais' },
  { code: 'KM', flag: '🇰🇲', label: 'Comores', lang: 'Francais' },
  { code: 'DJ', flag: '🇩🇯', label: 'Djibouti', lang: 'Francais' },
  { code: 'BI', flag: '🇧🇮', label: 'Burundi', lang: 'Francais' },
  { code: 'RW', flag: '🇷🇼', label: 'Rwanda', lang: 'Francais' },
  { code: 'FR', flag: '🇫🇷', label: 'France', lang: 'Francais' },
  { code: 'BE', flag: '🇧🇪', label: 'Belgique', lang: 'Francais' },
  { code: 'CH', flag: '🇨🇭', label: 'Suisse', lang: 'Francais' },
  { code: 'CA', flag: '🇨🇦', label: 'Canada', lang: 'Francais' },
];

export default function Onboarding({ onDone }: { onDone: (country: string) => void }) {
  const [selected, setSelected] = useState('CI');

  return (
    <div className="flex-1 flex flex-col p-6 fade-in">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-4xl shadow-xl shadow-red-500/20 mb-6">🚒</div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">GERMS Alert</h1>
        <p className="text-sm text-gray-500 mb-8">Signalement citoyen d'urgence</p>

        <p className="text-sm font-semibold text-gray-700 mb-3 self-start">Selectionnez votre pays</p>
        <div className="w-full space-y-2 mb-8">
          {countries.map(c => (
            <button key={c.code} onClick={() => setSelected(c.code)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all ${
                selected === c.code ? 'border-red-500 bg-red-50 shadow-sm' : 'border-gray-100 bg-white hover:bg-gray-50'
              }`}>
              <span className="text-2xl">{c.flag}</span>
              <div className="flex-1 text-left">
                <p className="font-semibold text-gray-900 text-sm">{c.label}</p>
                <p className="text-xs text-gray-400">{c.lang}</p>
              </div>
              {selected === c.code && <span className="text-red-500 font-bold">✓</span>}
            </button>
          ))}
        </div>
      </div>

      <button onClick={() => { storage.setOnboarded(); onDone(selected); }} className="btn-primary">
        Continuer
      </button>
    </div>
  );
}
