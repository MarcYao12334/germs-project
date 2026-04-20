import { useState } from 'react';
import { storage } from '../lib/storage';
import { citizenSync } from '../lib/sync';
import { ActiveAlert, Alert } from '../types';

interface Props { reportData: any; onSubmit: (a: ActiveAlert) => void; onBack: () => void; }

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
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-[0.97] bg-stone-100 text-stone-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div>
          <h2 className="text-lg font-bold font-display text-stone-900">
            Details
          </h2>
          <p className="text-xs font-body text-stone-400">
            Etape 2/3 — Decrivez la situation
          </p>
        </div>
      </div>

      {/* Incident summary */}
      <div
        className="rounded-2xl p-3.5 mb-5 flex items-center gap-3"
        style={{
          background: 'linear-gradient(135deg, #fef9f0 0%, #fef3c7 100%)',
          border: '1.5px solid rgba(180,83,9,0.14)',
        }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-base"
          style={{ background: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)' }}
        >
          ▲
        </div>
        <div>
          <p className="font-bold text-sm font-display text-stone-900">
            {reportData.type_incident}
          </p>
          <p className="text-[11px] font-body text-stone-400">
            {reportData.adresse?.length > 50 ? reportData.adresse.substring(0, 50) + '...' : reportData.adresse}
          </p>
        </div>
      </div>

      <div className="flex-1">
        <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 font-body text-stone-500">
          Description (optionnel)
        </label>
        <textarea
          className="input-light min-h-[100px] resize-none mb-5 font-body"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Decrivez la situation en quelques mots..."
        />

        <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 font-body text-stone-500">
          Photo (optionnel)
        </label>
        {photo ? (
          <div className="relative mb-5">
            <img src={photo} className="w-full h-44 object-cover rounded-2xl" alt="preview" style={{ border: '1.5px solid rgba(180,83,9,0.12)' }} />
            <button
              onClick={() => setPhoto(null)}
              className="absolute top-2 right-2 w-8 h-8 rounded-full text-white text-sm flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.55)' }}
            >
              ✕
            </button>
          </div>
        ) : (
          <label
            className="block w-full rounded-2xl p-6 text-center cursor-pointer transition-all mb-5"
            style={{
              border: '2px dashed #d6d3d1',
              background: '#fafaf9',
            }}
          >
            <div
              className="w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center"
              style={{ background: 'rgba(180,83,9,0.08)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            <span className="text-sm font-medium font-body text-stone-400">
              Prendre une photo
            </span>
            <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" />
          </label>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={sending}
        className="w-full py-4 rounded-xl font-bold text-white text-[15px] transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2 font-body bg-gradient-to-r from-sahel-700 to-sahel-600 shadow-sahel"
      >
        {sending ? (
          <>
            <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            Envoi en cours...
          </>
        ) : (
          'ENVOYER L\'ALERTE'
        )}
      </button>
    </div>
  );
}
