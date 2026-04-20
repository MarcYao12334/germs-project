import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, useMap, Tooltip } from 'react-leaflet';
import { Mission } from '../lib/data';
import 'leaflet/dist/leaflet.css';

interface MapTarget { lat: number; lng: number; label: string; missionId: string; }
interface Props { target: MapTarget | null; missions: Mission[]; onViewDetails: (id: string) => void; }

const incidentIcons: Record<string, string> = {
  'Incendie': '🔥', 'Accident de route': '🚗', 'Fuite de gaz': '💧',
  'Secours a personne': '🏥', 'Inondation': '🌊', 'Autre urgence': '⚡',
};

const statusColors: Record<string, { stroke: string; fill: string }> = {
  NOUVEAU: { stroke: '#3b82f6', fill: '#3b82f640' },
  EN_ROUTE: { stroke: '#a855f7', fill: '#a855f740' },
  SUR_PLACE: { stroke: '#f97316', fill: '#f9731640' },
  TERMINE: { stroke: '#22c55e', fill: '#22c55e40' },
};

function FlyTo({ target }: { target: MapTarget | null }) {
  const map = useMap();
  const first = useRef(true);
  useEffect(() => {
    if (target) {
      if (first.current) {
        map.setView([target.lat, target.lng], 15);
        first.current = false;
      } else {
        map.flyTo([target.lat, target.lng], 15, { duration: 1.2 });
      }
    }
  }, [target, map]);
  return null;
}

function MapLegend() {
  return (
    <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 shadow-lg px-3 py-2.5">
      <p className="text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Legende</p>
      <div className="space-y-1.5">
        {[
          { color: '#3b82f6', label: 'Nouveau' },
          { color: '#a855f7', label: 'En route' },
          { color: '#f97316', label: 'Sur place' },
          { color: '#22c55e', label: 'Terminee' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-[10px] text-gray-600 font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MapScreen({ target, missions, onViewDetails }: Props) {
  const center: [number, number] = target ? [target.lat, target.lng] : [5.3400, -4.0100];
  const activeMissions = missions.filter(m => m.statut !== 'TERMINE');

  return (
    <div className="flex-1 flex flex-col overflow-hidden fade-in">
      {/* Header info */}
      {target && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">🧭</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider opacity-80">Navigation en cours</p>
              <p className="text-sm font-semibold truncate">{target.label}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-mono opacity-70">{target.lat.toFixed(4)}, {target.lng.toFixed(4)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="flex-1 relative">
        <MapLegend />
        <MapContainer center={center} zoom={target ? 15 : 13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
          <FlyTo target={target} />
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" attribution="CARTO" />

          {/* All missions */}
          {missions.map(m => {
            const col = statusColors[m.statut] || statusColors.NOUVEAU;
            const isTarget = target?.missionId === m.id;
            return (
              <CircleMarker key={m.id} center={[m.lat, m.lng]} radius={isTarget ? 18 : 10}
                pathOptions={{ color: col.stroke, fillColor: col.fill, fillOpacity: isTarget ? 0.7 : 0.4, weight: isTarget ? 4 : 2.5 }}
                eventHandlers={{ click: () => onViewDetails(m.id) }}>
                <Tooltip permanent={isTarget} direction="top" offset={[0, -14]}
                  className="!bg-white !border !border-gray-200 !shadow-lg !rounded-xl !px-2.5 !py-1.5 !text-[11px]">
                  <div className="text-center leading-tight">
                    <p className="font-bold" style={{ color: col.stroke }}>{incidentIcons[m.type_incident] || '⚠️'} {m.type_incident}</p>
                    {isTarget && <p className="text-gray-400 font-mono text-[9px] mt-0.5">{m.code}</p>}
                  </div>
                </Tooltip>
                <Popup>
                  <div className="text-xs min-w-[160px]">
                    <p className="font-bold text-gray-900 text-sm mb-1">{incidentIcons[m.type_incident] || '⚠️'} {m.type_incident}</p>
                    <p className="text-gray-500 mb-0.5">📍 {m.adresse}</p>
                    <p className="text-gray-400 font-mono text-[10px]">{m.code}</p>
                    {m.distance_km > 0 && (
                      <div className="flex gap-3 mt-1.5 text-gray-600">
                        <span>🧭 {m.distance_km} km</span>
                        <span>⏱️ {m.eta_minutes} min</span>
                      </div>
                    )}
                    <button onClick={() => onViewDetails(m.id)}
                      className="mt-2 w-full py-1.5 bg-gray-800 text-white rounded-lg text-[11px] font-semibold hover:bg-gray-700 transition-colors">
                      Voir details
                    </button>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

          {/* Route line from current position indicator to target */}
          {target && (
            <CircleMarker center={[target.lat, target.lng]} radius={24}
              pathOptions={{ color: '#ef4444', fillColor: '#ef444420', fillOpacity: 0.3, weight: 3, dashArray: '6 4' }}>
            </CircleMarker>
          )}
        </MapContainer>
      </div>

      {/* Bottom action bar */}
      {target && (
        <div className="bg-white border-t border-gray-100 px-4 py-3 shrink-0">
          <div className="flex gap-2">
            <button onClick={() => onViewDetails(target.missionId)}
              className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold text-sm transition-all active:scale-[0.98]">
              Voir la mission
            </button>
            <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${target.lat},${target.lng}&travelmode=driving`, '_blank')}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all active:scale-[0.98]">
              🧭 Google Maps
            </button>
          </div>
        </div>
      )}

      {/* No target — show all missions */}
      {!target && activeMissions.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg pointer-events-auto">
            <p className="text-3xl mb-2">🗺️</p>
            <p className="text-sm font-bold text-gray-900">Aucune mission active</p>
            <p className="text-xs text-gray-500 mt-1">Les missions apparaitront ici sur la carte</p>
          </div>
        </div>
      )}
    </div>
  );
}
