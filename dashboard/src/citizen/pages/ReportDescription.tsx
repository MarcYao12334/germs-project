import { useState } from 'react';
import { storage } from '../lib/storage';
import { citizenSync } from '../lib/sync';
import { ActiveAlert, Alert } from '../types';

interface Props { reportData: any; onNext: (d: any) => void; onSubmit: (a: ActiveAlert) => void; onBack: () => void; }

export default function ReportDescription({ reportData, onSubmit, onBack }: Props) {
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    setSending(true);
    const profile = storage.getProfile()!;
    const code = `ALT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const alert: Alert = {
      id: `alert-${Date.now()}`, code,
      type_incident: reportData.type_incident,
      description, lat: reportData.lat, lng: reportData.lng,
      adresse: reportData.adresse, statut: 'PENDING',
      utilisateur_id: profile.id,
      citoyen_nom: profile.nom, citoyen_prenoms: profile.prenoms,
      citoyen_telephone: profile.telephone,
      citoyen_reputation: profile.reputation,
      pays: profile.pays, langue: profile.langue,
      media_urls: photo ? [photo] : [],
      created_at: new Date().toISOString(),
    };

    const activeAlert: ActiveAlert = { alert, currentStep: 1 };

    // Send to Dashboard via BroadcastChannel
    console.log('[Citizen] Sending alert:new via BroadcastChannel...', alert.code);
    citizenSync.send('alert:new', alert);

    setTimeout(() => {
      setSending(false);
      onSubmit(activeAlert);
    }, 800);
  };

  return (
    <div className="flex-1 flex flex-col p-5 fade-in">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg">←</button>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Details</h2>
          <p className="text-xs text-gray-500">Etape 2/3 — Decrivez la situation</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-2xl p-3 mb-4 flex items-center gap-3">
        <span className="text-2xl">{reportData.type_incident === 'Incendie' ? '🔥' : reportData.type_incident === 'Accident de route' ? '🚗' : '⚠️'}</span>
        <div>
          <p className="font-bold text-sm text-gray-900">{reportData.type_incident}</p>
          <p className="text-[11px] text-gray-500 truncate">{reportData.adresse?.substring(0, 50)}...</p>
        </div>
      </div>

      <div className="flex-1">
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Description (optionnel)</label>
        <textarea className="input-field min-h-[100px] resize-none mb-4" value={description} onChange={e => setDescription(e.target.value)} placeholder="Decrivez la situation en quelques mots..." />

        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Photo (optionnel)</label>
        {photo ? (
          <div className="relative mb-4">
            <img src={photo} className="w-full h-40 object-cover rounded-2xl" alt="preview" />
            <button onClick={() => setPhoto(null)} className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full text-white text-sm flex items-center justify-center">✕</button>
          </div>
        ) : (
          <label className="block w-full border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center cursor-pointer hover:border-red-300 hover:bg-red-50/30 transition-all mb-4">
            <span className="text-3xl block mb-1">📷</span>
            <span className="text-sm text-gray-500">Prendre une photo</span>
            <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" />
          </label>
        )}
      </div>

      <button onClick={handleSubmit} disabled={sending} className="btn-primary disabled:opacity-50">
        {sending ? '📡 Envoi en cours...' : '🚨 ENVOYER L\'ALERTE'}
      </button>
    </div>
  );
}
