import { useState } from 'react';
import { Mission } from '../lib/data';

const statusFlow = ['NOUVEAU', 'EN_ROUTE', 'SUR_PLACE', 'TERMINE'];
const statusLabels: Record<string, { label: string; icon: string; color: string }> = {
  NOUVEAU: { label: 'Nouveau', icon: '🟦', color: 'bg-blue-100 text-blue-700' },
  EN_ROUTE: { label: 'En route', icon: '🚒', color: 'bg-purple-500 text-white' },
  SUR_PLACE: { label: 'Sur place', icon: '🔥', color: 'bg-orange-500 text-white' },
  TERMINE: { label: 'Terminee', icon: '✅', color: 'bg-emerald-500 text-white' },
  ANNULEE: { label: 'Annulee', icon: '🚫', color: 'bg-red-500 text-white' },
};

interface Props {
  mission: Mission;
  onBack: () => void;
  onStatusChange: (id: string, newStatus: string) => void;
  onCall: (tel: string) => void;
  onEnRoute: (id: string) => void;
}

export default function MissionDetail({ mission, onBack, onStatusChange, onCall, onEnRoute }: Props) {
  const currentIdx = statusFlow.indexOf(mission.statut);
  const nextStatus = currentIdx < statusFlow.length - 1 ? statusFlow[currentIdx + 1] : null;

  return (
    <div className="flex-1 overflow-y-auto fade-in">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white p-5 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg">←</button>
          <div className="flex-1">
            <p className="font-bold text-[15px]">{mission.type_incident}</p>
            <p className="text-xs text-gray-400 font-mono">{mission.code}</p>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex gap-2 flex-wrap">
          {statusFlow.map((s, i) => {
            const conf = statusLabels[s];
            const isCurrent = s === mission.statut;
            const isPast = i < currentIdx;
            return (
              <div key={s} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isCurrent ? conf.color + ' shadow-md' : isPast ? 'bg-white/20 text-white/80' : 'bg-white/5 text-white/30'
              }`}>
                {conf.icon} {conf.label}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Location */}
        <div className="bg-gray-50 rounded-2xl p-4">
          <p className="text-xs font-bold text-gray-500 mb-1">LOCALISATION</p>
          <p className="text-sm font-semibold text-gray-900 mb-1">📍 {mission.adresse}</p>
          <p className="text-xs text-gray-400">GPS: {mission.lat.toFixed(4)}, {mission.lng.toFixed(4)}</p>
          {mission.distance_km > 0 && (
            <div className="flex gap-4 mt-2">
              <p className="text-sm text-gray-600">🧭 <span className="font-bold">{mission.distance_km} km</span></p>
              <p className="text-sm text-gray-600">⏱️ <span className="font-bold">{mission.eta_minutes} min</span></p>
            </div>
          )}
        </div>

        {/* Description */}
        {mission.description && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-xs font-bold text-amber-600 mb-1">DESCRIPTION</p>
            <p className="text-sm text-gray-700">{mission.description}</p>
          </div>
        )}

        {/* Contact citoyen */}
        {mission.source === 'CITOYEN' && mission.citoyen_nom && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <p className="text-xs font-bold text-blue-600 mb-2">CONTACT CITOYEN</p>
            <p className="text-sm font-bold text-gray-900">👤 {mission.citoyen_nom}</p>
            {mission.citoyen_telephone && (
              <button onClick={() => onCall(mission.citoyen_telephone!)}
                className="mt-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all active:scale-[0.98]">
                📞 Appeler {mission.citoyen_telephone}
              </button>
            )}
          </div>
        )}

        {/* Status update */}
        {mission.statut !== 'TERMINE' && mission.statut !== 'ANNULEE' && (
          <div>
            <p className="text-xs font-bold text-gray-500 mb-2">METTRE A JOUR LE STATUT</p>
            <div className="grid grid-cols-3 gap-2">
              {mission.statut === 'NOUVEAU' && (
                <button onClick={() => onEnRoute(mission.id)}
                  className="col-span-3 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm transition-all active:scale-[0.98]">
                  🚒 En route
                </button>
              )}
              {mission.statut === 'EN_ROUTE' && (
                <button onClick={() => onStatusChange(mission.id, 'SUR_PLACE')}
                  className="col-span-3 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm transition-all active:scale-[0.98]">
                  🔥 Arrive sur place
                </button>
              )}
              {mission.statut === 'SUR_PLACE' && (
                <button onClick={() => onStatusChange(mission.id, 'TERMINE')}
                  className="col-span-3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all active:scale-[0.98]">
                  ✅ Intervention terminee
                </button>
              )}
            </div>
          </div>
        )}

        {mission.statut === 'TERMINE' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
            <p className="text-2xl mb-1">✅</p>
            <p className="font-bold text-emerald-700">Intervention terminee</p>
          </div>
        )}

        {mission.statut === 'ANNULEE' && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
            <p className="text-2xl mb-1">🚫</p>
            <p className="font-bold text-red-700">Mission annulee</p>
            <p className="text-xs text-red-500 mt-1">Cette mission a ete annulee par le centre de commandement.</p>
          </div>
        )}
      </div>
    </div>
  );
}
