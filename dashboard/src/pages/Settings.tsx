import { useState } from 'react';

export default function Settings() {
  const [country, setCountry] = useState('CI');
  const [timezone, setTimezone] = useState('Africa/Abidjan');
  const [currency, setCurrency] = useState('XOF');
  const [distanceUnit, setDistanceUnit] = useState('km');
  const [duplicateRadius, setDuplicateRadius] = useState(500);
  const [channels, setChannels] = useState({ sms: true, whatsapp: true, email: true, authenticator: false });

  return (
    <div className="p-5 max-w-3xl">
      <h2 className="text-xl font-bold text-white mb-1">Configuration Système</h2>
      <p className="text-xs text-gray-500 mb-6">Paramètres géographiques et organisationnels (Admin uniquement)</p>

      <div className="space-y-6">
        {/* Geographic */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-white mb-4">🌍 Paramètres géographiques</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Pays / Région actif</label>
              <select value={country} onChange={e => setCountry(e.target.value)} className="input-field">
                <option value="FR">🇫🇷 France</option>
                <option value="CI">🇨🇮 Côte d'Ivoire</option>
                <option value="US">🇺🇸 États-Unis</option>
                <option value="GB">🇬🇧 Royaume-Uni</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Fuseau horaire</label>
              <select value={timezone} onChange={e => setTimezone(e.target.value)} className="input-field">
                <option value="Europe/Paris">Europe/Paris (UTC+1/+2)</option>
                <option value="Africa/Abidjan">Africa/Abidjan (UTC+0)</option>
                <option value="America/New_York">America/New_York (UTC-5/-4)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Devise</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)} className="input-field">
                <option value="EUR">EUR (€)</option>
                <option value="XOF">XOF (CFA)</option>
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Unité de distance</label>
              <select value={distanceUnit} onChange={e => setDistanceUnit(e.target.value)} className="input-field">
                <option value="km">Kilomètres (km)</option>
                <option value="miles">Miles</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Rayon de détection de doublons</label>
              <div className="flex items-center gap-3">
                <input type="range" min="100" max="2000" step="100" value={duplicateRadius} onChange={e => setDuplicateRadius(parseInt(e.target.value))} className="flex-1" />
                <span className="text-sm text-white font-mono w-16 text-right">{duplicateRadius} m</span>
              </div>
            </div>
          </div>
        </div>

        {/* Communication channels */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-white mb-4">📡 Canaux de communication</h3>
          <div className="space-y-2">
            {[
              { key: 'sms', label: 'SMS OTP', icon: '📱', desc: 'Standard universel' },
              { key: 'whatsapp', label: 'WhatsApp OTP', icon: '💬', desc: 'Pour pays où WhatsApp est dominant' },
              { key: 'email', label: 'Email OTP', icon: '📧', desc: 'Pour pays sans mobile ubiquitaire' },
              { key: 'authenticator', label: 'Authenticator App', icon: '🔐', desc: 'Google Authenticator, Authy' },
            ].map(ch => (
              <label key={ch.key} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-700/30 cursor-pointer hover:bg-gray-700/50 transition-colors">
                <input type="checkbox" checked={(channels as any)[ch.key]} onChange={e => setChannels(prev => ({ ...prev, [ch.key]: e.target.checked }))} className="rounded" />
                <span className="text-base">{ch.icon}</span>
                <div className="flex-1">
                  <p className="text-sm text-white">{ch.label}</p>
                  <p className="text-[10px] text-gray-500">{ch.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Incident types */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-white mb-4">🔥 Types d'incidents (configurables par pays)</h3>
          <div className="flex flex-wrap gap-2">
            {['🔥 Incendie', '🚗 Accident de route', '🏥 Secours à personne', '💨 Fuite de gaz', '🌊 Inondation', '⚡ Autre urgence'].map(type => (
              <span key={type} className="badge bg-gray-700 text-gray-300 py-1.5 px-3">{type}</span>
            ))}
            <button className="badge bg-red-600/20 text-red-400 py-1.5 px-3 hover:bg-red-600/30 transition-colors">+ Ajouter</button>
          </div>
        </div>

        {/* Save */}
        <div className="flex gap-2">
          <button className="btn-primary">💾 Sauvegarder les paramètres</button>
          <button className="btn-secondary">Réinitialiser</button>
        </div>
      </div>
    </div>
  );
}
