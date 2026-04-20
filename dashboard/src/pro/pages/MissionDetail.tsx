import { useState } from 'react';
import { Mission } from '../lib/data';

const statusFlow = ['NOUVEAU', 'EN_ROUTE', 'SUR_PLACE', 'TERMINE'];
const statusLabels: Record<string, { label: string; icon: string; color: string }> = {
  NOUVEAU:   { label: 'Nouveau',   icon: '🟦', color: 'bg-cyan-900/60 text-cyan-300 border border-cyan-600/40' },
  EN_ROUTE:  { label: 'En route',  icon: '🚒', color: 'bg-violet-800/70 text-violet-200 border border-violet-600/40' },
  SUR_PLACE: { label: 'Sur place', icon: '🔥', color: 'bg-sahel-700/70 text-amber-200 border border-sahel-600/40' },
  TERMINE:   { label: 'Terminee', icon: '✅', color: 'bg-emerald-800/70 text-emerald-200 border border-emerald-600/40' },
};

interface Props {
  mission: Mission;
  onBack: () => void;
  onStatusChange: (id: string, newStatus: string) => void;
  onCall: (tel: string) => void;
  onNavigate: (lat: number, lng: number) => void;
}

export default function MissionDetail({ mission, onBack, onStatusChange, onCall, onNavigate }: Props) {
  const currentIdx = statusFlow.indexOf(mission.statut);
  const nextStatus = currentIdx < statusFlow.length - 1 ? statusFlow[currentIdx + 1] : null;

  return (
    <div className="flex-1 overflow-y-auto fade-in">
      {/* Header */}
      <div
        className="text-white p-5 pb-6"
        style={{ background: 'linear-gradient(135deg, #0a1525 0%, #0d1e38 50%, #091525 100%)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 transition-all active:scale-[0.97]"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            &#x2190;
          </button>
          <div className="flex-1">
            <p
              className="font-bold text-[15px] text-white font-display"
              style={{ fontFamily: 'Sora, sans-serif' }}
            >
              {mission.type_incident}
            </p>
            <p
              className="text-[10px] text-slate-600 font-mono"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              {mission.code}
            </p>
          </div>
        </div>

        {/* Status pipeline */}
        <div className="flex gap-2 flex-wrap">
          {statusFlow.map((s, i) => {
            const conf = statusLabels[s];
            const isCurrent = s === mission.statut;
            const isPast = i < currentIdx;
            return (
              <div
                key={s}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all font-body ${
                  isCurrent
                    ? conf.color + ' shadow-md'
                    : isPast
                    ? 'bg-white/8 text-white/50 border border-white/6'
                    : 'bg-white/3 text-white/15 border border-white/4'
                }`}
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                {conf.icon} {conf.label}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Location */}
        <div
          className="rounded-2xl p-4"
          style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <p
            className="text-[10px] font-bold text-slate-600 mb-1 tracking-widest uppercase font-body"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            Localisation
          </p>
          <p
            className="text-sm font-semibold text-slate-200 mb-1 font-body"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            <span className="text-accent-600 mr-1">&#x25B6;</span> {mission.adresse}
          </p>
          <p
            className="text-xs text-slate-600 font-mono"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            GPS: {mission.lat.toFixed(4)}, {mission.lng.toFixed(4)}
          </p>
          {mission.distance_km > 0 && (
            <div className="flex gap-5 mt-2">
              <p className="text-sm text-slate-400 font-body" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Dist&nbsp;
                <span className="font-bold text-slate-200 font-mono" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {mission.distance_km} km
                </span>
              </p>
              <p className="text-sm text-slate-400 font-body" style={{ fontFamily: 'Manrope, sans-serif' }}>
                ETA&nbsp;
                <span className="font-bold text-slate-200 font-mono" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {mission.eta_minutes} min
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Description */}
        {mission.description && (
          <div
            className="rounded-2xl p-4"
            style={{ background: 'rgba(180,83,9,0.07)', border: '1px solid rgba(180,83,9,0.25)' }}
          >
            <p
              className="text-[10px] font-bold text-sahel-600 mb-1 tracking-widest uppercase font-body"
              style={{ fontFamily: 'Manrope, sans-serif', color: '#d97706' }}
            >
              Description
            </p>
            <p
              className="text-sm text-slate-300 font-body"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              {mission.description}
            </p>
          </div>
        )}

        {/* Contact citoyen */}
        {mission.source === 'CITOYEN' && mission.citoyen_nom && (
          <div
            className="rounded-2xl p-4"
            style={{ background: 'rgba(8,145,178,0.07)', border: '1px solid rgba(8,145,178,0.20)' }}
          >
            <p
              className="text-[10px] font-bold text-accent-600 mb-2 tracking-widest uppercase font-body"
              style={{ fontFamily: 'Manrope, sans-serif', color: '#0891b2' }}
            >
              Contact Citoyen
            </p>
            <p
              className="text-sm font-bold text-slate-200 font-body"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              <span className="text-slate-600 mr-1">&#x25CF;</span> {mission.citoyen_nom}
            </p>
            {mission.citoyen_telephone && (
              <button
                onClick={() => onCall(mission.citoyen_telephone!)}
                className="mt-3 w-full py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.97] text-white font-body shadow-lg shadow-cyan-900/20"
                style={{ background: 'linear-gradient(180deg, #0891b2 0%, #0e7490 100%)', fontFamily: 'Manrope, sans-serif' }}
              >
                &#x260E; Appeler {mission.citoyen_telephone}
              </button>
            )}
          </div>
        )}

        {/* Navigation */}
        {mission.statut !== 'TERMINE' && (
          <button
            onClick={() => onNavigate(mission.lat, mission.lng)}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.97] text-white flex items-center justify-center gap-2 font-body shadow-lg shadow-cyan-900/10"
            style={{
              background: 'linear-gradient(180deg, #0c4a6e 0%, #083344 100%)',
              border: '1px solid rgba(8,145,178,0.20)',
              fontFamily: 'Manrope, sans-serif',
            }}
          >
            &#x25B6; Lancer la navigation GPS
          </button>
        )}

        {/* Status update */}
        {mission.statut !== 'TERMINE' && (
          <div>
            <p
              className="text-[10px] font-bold text-slate-600 mb-2 tracking-widest uppercase font-body"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              Mettre a jour le statut
            </p>
            <div className="grid grid-cols-3 gap-2">
              {mission.statut === 'NOUVEAU' && (
                <button
                  onClick={() => onStatusChange(mission.id, 'EN_ROUTE')}
                  className="col-span-3 py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.97] text-white font-body shadow-lg shadow-violet-900/20"
                  style={{ background: 'linear-gradient(180deg, #7c3aed 0%, #6d28d9 100%)', fontFamily: 'Manrope, sans-serif' }}
                >
                  &#x1F692; En route
                </button>
              )}
              {mission.statut === 'EN_ROUTE' && (
                <button
                  onClick={() => onStatusChange(mission.id, 'SUR_PLACE')}
                  className="col-span-3 py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.97] text-white font-body shadow-lg shadow-amber-900/20"
                  style={{ background: 'linear-gradient(180deg, #d97706 0%, #b45309 100%)', fontFamily: 'Manrope, sans-serif' }}
                >
                  &#x1F525; Arrive sur place
                </button>
              )}
              {mission.statut === 'SUR_PLACE' && (
                <button
                  onClick={() => onStatusChange(mission.id, 'TERMINE')}
                  className="col-span-3 py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.97] text-white font-body shadow-lg shadow-emerald-900/20"
                  style={{ background: 'linear-gradient(180deg, #059669 0%, #047857 100%)', fontFamily: 'Manrope, sans-serif' }}
                >
                  &#x2713; Intervention terminee
                </button>
              )}
            </div>
          </div>
        )}

        {mission.statut === 'TERMINE' && (
          <div
            className="rounded-2xl p-5 text-center"
            style={{ background: 'rgba(5,150,105,0.07)', border: '1px solid rgba(5,150,105,0.20)' }}
          >
            <p className="text-2xl mb-2">&#x2705;</p>
            <p
              className="font-bold text-emerald-400 font-display"
              style={{ fontFamily: 'Sora, sans-serif' }}
            >
              Intervention terminee
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
