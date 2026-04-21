import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, useMap, Tooltip, Circle } from 'react-leaflet';
import { Mission } from '../lib/data';
import { getCountryCenter } from '../../lib/countries';
import 'leaflet/dist/leaflet.css';

interface MapTarget { lat: number; lng: number; label: string; missionId: string; }
interface RouteInfo { distance_km: number; duration_min: number; coordinates: [number, number][]; }

interface Props {
  target: MapTarget | null;
  missions: Mission[];
  onViewDetails: (id: string) => void;
  onArrived?: (missionId: string) => void;
  defaultCountry?: string;
}

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

const ARRIVAL_THRESHOLD_METERS = 150;

// Calculate distance between two coordinates in meters (Haversine)
function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Fetch route from OSRM (free, no API key needed)
async function fetchRoute(fromLat: number, fromLng: number, toLat: number, toLng: number): Promise<RouteInfo | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson&alternatives=true`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.code !== 'Ok' || !data.routes?.length) return null;
    // Pick the best route (first = fastest)
    const route = data.routes[0];
    const coords: [number, number][] = route.geometry.coordinates.map((c: number[]) => [c[1], c[0]]);
    return {
      distance_km: Math.round(route.distance / 100) / 10,
      duration_min: Math.round(route.duration / 60),
      coordinates: coords,
    };
  } catch (err) {
    console.error('[MapScreen] OSRM route error:', err);
    return null;
  }
}

// Component to fit map bounds to route
function FitRoute({ route, userPos }: { route: RouteInfo | null; userPos: [number, number] | null }) {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    if (route && route.coordinates.length > 1 && !fitted.current) {
      const allPoints = [...route.coordinates];
      if (userPos) allPoints.push(userPos);
      const lats = allPoints.map(p => p[0]);
      const lngs = allPoints.map(p => p[1]);
      map.fitBounds([[Math.min(...lats), Math.min(...lngs)], [Math.max(...lats), Math.max(...lngs)]], { padding: [40, 40] });
      fitted.current = true;
    }
  }, [route, userPos, map]);
  return null;
}

// Recenter map on user position
function RecenterOnUser({ userPos, follow }: { userPos: [number, number] | null; follow: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (userPos && follow) {
      map.setView(userPos, map.getZoom(), { animate: true });
    }
  }, [userPos, follow, map]);
  return null;
}

export default function MapScreen({ target, missions, onViewDetails, onArrived, defaultCountry }: Props) {
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [followUser, setFollowUser] = useState(false);
  const [arrived, setArrived] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const watchIdRef = useRef<number | null>(null);
  const arrivedRef = useRef(false);

  const cc = getCountryCenter(defaultCountry || 'CI');
  const center: [number, number] = target ? [target.lat, target.lng] : [cc.lat, cc.lng];
  const activeMissions = missions.filter(m => m.statut !== 'TERMINE');

  // Start GPS tracking
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsError('GPS non disponible');
      return;
    }

    arrivedRef.current = false;
    setArrived(false);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const newPos: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserPos(newPos);
        setGpsError('');

        // Check arrival proximity
        if (target && !arrivedRef.current) {
          const dist = distanceMeters(newPos[0], newPos[1], target.lat, target.lng);
          if (dist < ARRIVAL_THRESHOLD_METERS) {
            arrivedRef.current = true;
            setArrived(true);
            if (onArrived) onArrived(target.missionId);
          }
        }
      },
      (err) => {
        console.error('[GPS]', err);
        setGpsError('Impossible d\'acceder au GPS');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 3000 }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [target, onArrived]);

  // Fetch route when user position is available and target exists
  useEffect(() => {
    if (!userPos || !target) return;
    if (arrived) return;

    setLoadingRoute(true);
    fetchRoute(userPos[0], userPos[1], target.lat, target.lng).then(r => {
      setRoute(r);
      setLoadingRoute(false);
    });
  }, [userPos?.[0]?.toFixed(3), userPos?.[1]?.toFixed(3), target?.missionId, arrived]);

  // Remaining distance/ETA from current position
  const liveDistance = userPos && target
    ? Math.round(distanceMeters(userPos[0], userPos[1], target.lat, target.lng))
    : null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden fade-in">
      {/* Navigation header */}
      {target && (
        <div className={`px-4 py-3 shrink-0 ${arrived ? 'bg-gradient-to-r from-emerald-600 to-emerald-500' : 'bg-gradient-to-r from-blue-600 to-indigo-600'} text-white`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">
              {arrived ? '📍' : '🧭'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                {arrived ? 'Arrive sur place' : 'Navigation en cours'}
              </p>
              <p className="text-sm font-semibold truncate">{target.label}</p>
            </div>
            <div className="text-right">
              {route && !arrived && (
                <>
                  <p className="text-lg font-extrabold">{route.duration_min} min</p>
                  <p className="text-[10px] opacity-80">{route.distance_km} km</p>
                </>
              )}
              {liveDistance !== null && !arrived && !route && (
                <>
                  <p className="text-lg font-extrabold">{liveDistance < 1000 ? `${liveDistance} m` : `${(liveDistance / 1000).toFixed(1)} km`}</p>
                  <p className="text-[10px] opacity-80">a vol d'oiseau</p>
                </>
              )}
              {arrived && (
                <p className="text-sm font-bold">✅ Sur place</p>
              )}
            </div>
          </div>

          {/* Route info bar */}
          {route && !arrived && (
            <div className="flex items-center gap-3 mt-2 bg-white/10 rounded-xl px-3 py-2">
              <div className="flex-1">
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-blue-300" />
                  <span>Itineraire le plus rapide</span>
                </div>
              </div>
              <span className="text-xs font-mono opacity-80">{route.distance_km} km — {route.duration_min} min</span>
            </div>
          )}

          {loadingRoute && (
            <p className="text-[11px] mt-2 opacity-70 animate-pulse">Calcul de l'itineraire...</p>
          )}
        </div>
      )}

      {/* GPS error */}
      {gpsError && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-700 font-medium">
          ⚠️ {gpsError} — L'itineraire sera calcule des que le GPS sera disponible
        </div>
      )}

      {/* Map */}
      <div className="flex-1 relative">
        {/* Map controls */}
        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
          {userPos && (
            <button onClick={() => setFollowUser(!followUser)}
              className={`w-10 h-10 rounded-xl shadow-lg flex items-center justify-center text-lg transition-all ${followUser ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
              📍
            </button>
          )}
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 shadow-lg px-3 py-2.5">
          <p className="text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Legende</p>
          <div className="space-y-1.5">
            {[
              { color: '#3b82f6', label: 'Votre position' },
              { color: '#a855f7', label: 'En route' },
              { color: '#f97316', label: 'Sur place' },
              { color: '#ef4444', label: 'Destination' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-[10px] text-gray-600 font-medium">{item.label}</span>
              </div>
            ))}
            {route && (
              <div className="flex items-center gap-2">
                <span className="w-4 h-0.5 rounded shrink-0" style={{ backgroundColor: '#3b82f6' }} />
                <span className="text-[10px] text-gray-600 font-medium">Itineraire</span>
              </div>
            )}
          </div>
        </div>

        <MapContainer center={center} zoom={target ? 14 : 13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
          <FitRoute route={route} userPos={userPos} />
          <RecenterOnUser userPos={userPos} follow={followUser} />
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" attribution="CARTO" />

          {/* Route polyline */}
          {route && !arrived && (
            <>
              {/* Shadow line */}
              <Polyline positions={route.coordinates} pathOptions={{ color: '#1e40af', weight: 8, opacity: 0.15 }} />
              {/* Main route line */}
              <Polyline positions={route.coordinates} pathOptions={{ color: '#3b82f6', weight: 5, opacity: 0.85 }} />
            </>
          )}

          {/* User position */}
          {userPos && (
            <>
              {/* Accuracy circle */}
              <Circle center={userPos} radius={50}
                pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.08, weight: 1, opacity: 0.3 }} />
              {/* User dot */}
              <CircleMarker center={userPos} radius={8}
                pathOptions={{ color: '#ffffff', fillColor: '#3b82f6', fillOpacity: 1, weight: 3 }}>
                <Tooltip permanent direction="top" offset={[0, -12]}
                  className="!bg-blue-600 !text-white !border-0 !shadow-lg !rounded-lg !px-2 !py-1 !text-[10px] !font-bold">
                  Vous
                </Tooltip>
              </CircleMarker>
            </>
          )}

          {/* Destination marker */}
          {target && (
            <>
              <Circle center={[target.lat, target.lng]} radius={ARRIVAL_THRESHOLD_METERS}
                pathOptions={{ color: arrived ? '#22c55e' : '#ef4444', fillColor: arrived ? '#22c55e' : '#ef4444', fillOpacity: 0.08, weight: 1.5, dashArray: arrived ? undefined : '8 6' }} />
              <CircleMarker center={[target.lat, target.lng]} radius={14}
                pathOptions={{ color: arrived ? '#22c55e' : '#ef4444', fillColor: arrived ? '#22c55e40' : '#ef444440', fillOpacity: 0.6, weight: 3 }}>
                <Tooltip permanent direction="top" offset={[0, -16]}
                  className="!bg-white !border !border-gray-200 !shadow-lg !rounded-xl !px-2.5 !py-1.5 !text-[11px]">
                  <div className="text-center leading-tight">
                    <p className="font-bold" style={{ color: arrived ? '#22c55e' : '#ef4444' }}>
                      {arrived ? '✅ Arrive' : '🎯 Destination'}
                    </p>
                    {liveDistance !== null && !arrived && (
                      <p className="text-gray-400 text-[9px] mt-0.5">
                        {liveDistance < 1000 ? `${liveDistance} m` : `${(liveDistance / 1000).toFixed(1)} km`}
                      </p>
                    )}
                  </div>
                </Tooltip>
              </CircleMarker>
            </>
          )}

          {/* Other missions */}
          {missions.filter(m => m.id !== target?.missionId).map(m => {
            const col = statusColors[m.statut] || statusColors.NOUVEAU;
            return (
              <CircleMarker key={m.id} center={[m.lat, m.lng]} radius={8}
                pathOptions={{ color: col.stroke, fillColor: col.fill, fillOpacity: 0.4, weight: 2 }}
                eventHandlers={{ click: () => onViewDetails(m.id) }}>
                <Popup>
                  <div className="text-xs min-w-[140px]">
                    <p className="font-bold text-gray-900 text-sm mb-1">{incidentIcons[m.type_incident] || '⚠️'} {m.type_incident}</p>
                    <p className="text-gray-500 mb-0.5">📍 {m.adresse}</p>
                    <p className="text-gray-400 font-mono text-[10px]">{m.code}</p>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      {/* Bottom action bar */}
      {target && (
        <div className="bg-white border-t border-gray-100 px-4 py-3 shrink-0">
          {arrived ? (
            <div className="text-center">
              <p className="text-emerald-600 font-bold text-sm mb-2">✅ Statut mis a jour — SUR PLACE</p>
              <button onClick={() => onViewDetails(target.missionId)}
                className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold text-sm transition-all active:scale-[0.98]">
                Voir les details de la mission
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => onViewDetails(target.missionId)}
                className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold text-sm transition-all active:scale-[0.98]">
                Details mission
              </button>
              <button onClick={() => setFollowUser(!followUser)}
                className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] ${followUser ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 border border-blue-200'}`}>
                {followUser ? '📍 Suivi ON' : '📍 Suivre'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* No target — show all missions on map */}
      {!target && activeMissions.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[500]">
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
