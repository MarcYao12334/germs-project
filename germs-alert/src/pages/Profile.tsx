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

  return (
    <div className="flex-1 p-5 fade-in">
      <div className="flex flex-col items-center mt-8 mb-6">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-4xl shadow-xl shadow-red-500/20 mb-3">
          👤
        </div>
        <h2 className="text-xl font-extrabold text-gray-900">{profile.prenoms} {profile.nom}</h2>
        <p className="text-sm text-gray-500">{profile.pays === 'FR' ? '🇫🇷' : '🌍'} Citoyen</p>
      </div>

      {/* Reputation */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-4 mb-5 text-center">
        <p className="text-xs font-semibold text-amber-600 mb-1">Score de reputation</p>
        <div className="flex items-center justify-center gap-1 mb-0.5">
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={`text-2xl ${i < full ? 'text-amber-400' : (i === full && half ? 'text-amber-300' : 'text-gray-200')}`}>★</span>
          ))}
        </div>
        <p className="text-lg font-extrabold text-gray-900">{profile.reputation.toFixed(1)}/5.0</p>
      </div>

      {/* Info */}
      <div className="space-y-3 mb-8">
        {[
          { label: 'Telephone', value: profile.telephone, icon: '📱' },
          { label: 'Email', value: profile.email || 'Non renseigne', icon: '📧' },
          { label: 'Pays', value: profile.pays, icon: '🌍' },
          { label: 'Inscrit le', value: new Date(profile.created_at).toLocaleDateString('fr-FR'), icon: '📅' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3">
            <span className="text-lg">{item.icon}</span>
            <div>
              <p className="text-[10px] text-gray-400 font-semibold">{item.label}</p>
              <p className="text-sm text-gray-900 font-medium">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      <button onClick={onLogout} className="w-full py-3 border-2 border-red-200 text-red-600 rounded-2xl font-bold text-sm hover:bg-red-50 transition-colors">
        Deconnexion
      </button>
    </div>
  );
}
