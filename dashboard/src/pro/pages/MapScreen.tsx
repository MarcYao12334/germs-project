import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, useMap, Tooltip, Circle } from 'react-leaflet';
import { Mission } from '../lib/data';
import { getCountryCenter } from '../../lib/countries';
import 'leaflet/dist/leaflet.css';

interface MapTarget { lat: number; lng: number; label: string; missionId: string; }
interface RouteInfo { distance_km: number; duration_min: number; duration_sec: number; coordinates: [number, number][]; }

interface Props {
  target: MapTarget | null;
  missions: Mission[];
  onViewDetails: (id: string) => void;
  onArrived?: (missionId: string) => void;
  onEtaUpdate?: (missionId: string, distance_km: number, eta_minutes: number) => void;
  defaultCountry?: string;
}

const statusColors: Record<string, { stroke: string; fill: string }> = {
  NOUVEAU: { stroke: '#3b82f6', fill: '#3b82f640' },
  EN_ROUTE: { stroke: '#a855f7', fill: '#a855f740' },
  SUR_PLACE: { stroke: '#f97316', fill: '#f9731640' },
  TERMINE: { stroke: '#22c55e', fill: '#22c55e40' },
};

const ARRIVAL_THRESHOLD_METERS = 150;
const ROUTE_RECALC_INTERVAL = 8000; // Recalculate every 8 seconds
const ETA_SYNC_INTERVAL = 5000; // Sync ETA to citizen every 5 seconds

function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Find the closest point on the route to the user and return remaining route
function getRemainingRoute(route: [number, number][], userPos: [number, number]): [number, number][] {
  let minDist = Infinity;
  let closestIdx = 0;
  for (let i = 0; i < route.length; i++) {
    const d = distanceMeters(userPos[0], userPos[1], route[i][0], route[i][1]);
    if (d < minDist) { minDist = d; closestIdx = i; }
  }
  return [userPos, ...route.slice(closestIdx)];
}

async function fetchRoute(fromLat: number, fromLng: number, toLat: number, toLng: number): Promise<RouteInfo | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson&steps=true`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.code !== 'Ok' || !data.routes?.length) return null;
    const route = data.routes[0];
    const coords: [number, number][] = route.geometry.coordinates.map((c: number[]) => [c[1], c[0]]);
    return {
      distance_km: Math.round(route.distance / 100) / 10,
      duration_min: Math.round(route.duration / 60),
      duration_sec: Math.round(route.duration),
      coordinates: coords,
    };
  } catch (err) {
    console.error('[MapScreen] OSRM route error:', err);
    return null;
  }
}

// Format seconds to "X min YY s" or "X h YY min"
function formatDuration(totalSec: number): string {
  if (totalSec < 60) return `${totalSec} s`;
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (min < 60) return `${min} min ${sec.toString().padStart(2, '0')} s`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h} h ${m.toString().padStart(2, '0')} min`;
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

// Auto-follow + zoom on user
function FollowDriver({ userPos, active }: { userPos: [number, number] | null; active: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (userPos && active) {
      map.setView(userPos, Math.max(map.getZoom(), 16), { animate: true, duration: 0.5 });
    }
  }, [userPos, active, map]);
  return null;
}

// Initial fit to show full route
function FitRoute({ route, userPos, done }: { route: RouteInfo | null; userPos: [number, number] | null; done: React.MutableRefObject<boolean> }) {
  const map = useMap();
  useEffect(() => {
    if (route && route.coordinates.length > 1 && !done.current) {
      const allPoints = [...route.coordinates];
      if (userPos) allPoints.push(userPos);
      const lats = allPoints.map(p => p[0]);
      const lngs = allPoints.map(p => p[1]);
      map.fitBounds([[Math.min(...lats), Math.min(...lngs)], [Math.max(...lats), Math.max(...lngs)]], { padding: [50, 50] });
      // After 2s start following user
      setTimeout(() => { done.current = true; }, 2000);
    }
  }, [route, userPos, map, done]);
  return null;
}

export default function MapScreen({ target, missions, onViewDetails, onArrived, onEtaUpdate, defaultCountry }: Props) {
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [remainingRoute, setRemainingRoute] = useState<[number, number][]>([]);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [arrived, setArrived] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [liveDistanceM, setLiveDistanceM] = useState<number | null>(null);
  const [liveEtaSec, setLiveEtaSec] = useState<number | null>(null);
  const [routeDistanceM, setRouteDistanceM] = useState<number | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const arrivedRef = useRef(false);
  const fittedRef = useRef(false);
  const lastRouteCalcRef = useRef(0);
  const lastSyncRef = useRef(0);
  const routeStartTimeRef = useRef(0);
  const routeStartDurationRef = useRef(0);
  const onArrivedRef = useRef(onArrived);
  const onEtaUpdateRef = useRef(onEtaUpdate);

  // Keep callback refs fresh without restarting effects
  useEffect(() => { onArrivedRef.current = onArrived; }, [onArrived]);
  useEffect(() => { onEtaUpdateRef.current = onEtaUpdate; }, [onEtaUpdate]);

  const cc = getCountryCenter(defaultCountry || 'CI');
  const center: [number, number] = target ? [target.lat, target.lng] : [cc.lat, cc.lng];

  // GPS tracking
  useEffect(() => {
    if (!navigator.geolocation) { setGpsError('GPS non disponible'); return; }

    arrivedRef.current = false;
    setArrived(false);
    fittedRef.current = false;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const newPos: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserPos(newPos);
        setGpsError('');

        // Live distance
        if (target) {
          const dist = Math.round(distanceMeters(newPos[0], newPos[1], target.lat, target.lng));
          setLiveDistanceM(dist);

          // Auto-arrival
          if (!arrivedRef.current && dist < ARRIVAL_THRESHOLD_METERS) {
            arrivedRef.current = true;
            setArrived(true);
            setLiveEtaSec(0);
            setRouteDistanceM(0);
            setLiveDistanceM(0);
            if (onArrivedRef.current) onArrivedRef.current(target.missionId);
          }
        }
      },
      () => setGpsError('Impossible d\'acceder au GPS'),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 2000 }
    );

    return () => { if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current); };
  }, [target?.missionId]);

  // Route calculation — periodic recalculation
  useEffect(() => {
    if (!userPos || !target || arrived) return;

    const now = Date.now();
    if (now - lastRouteCalcRef.current < ROUTE_RECALC_INTERVAL && route) return;
    lastRouteCalcRef.current = now;

    setLoadingRoute(!route); // Only show loading on first calc
    fetchRoute(userPos[0], userPos[1], target.lat, target.lng).then(r => {
      if (r) {
        setRoute(r);
        setRouteDistanceM(Math.round(r.distance_km * 1000));
        setLiveEtaSec(r.duration_sec);
        routeStartTimeRef.current = Date.now();
        routeStartDurationRef.current = r.duration_sec;
        setLoadingRoute(false);

        // Sync to citizen
        if (onEtaUpdateRef.current && now - lastSyncRef.current >= ETA_SYNC_INTERVAL) {
          lastSyncRef.current = now;
          onEtaUpdateRef.current(target.missionId, r.distance_km, r.duration_min);
        }
      }
    });
  }, [userPos, target, arrived]);

  // Update remaining route segment (visual: route gets "eaten")
  useEffect(() => {
    if (route && userPos && !arrived) {
      setRemainingRoute(getRemainingRoute(route.coordinates, userPos));
    }
  }, [route, userPos, arrived]);

  // Countdown timer — decrement ETA every second between route recalculations
  useEffect(() => {
    if (arrived || !route) return;
    const interval = setInterval(() => {
      const elapsed = Math.round((Date.now() - routeStartTimeRef.current) / 1000);
      const remaining = Math.max(0, routeStartDurationRef.current - elapsed);
      setLiveEtaSec(remaining);
    }, 1000);
    return () => clearInterval(interval);
  }, [route, arrived]);

  // Use OSRM route distance (real road distance), fallback to Haversine
  const displayDistance = arrived ? '0 m' : routeDistanceM !== null ? formatDistance(routeDistanceM) : liveDistanceM !== null ? formatDistance(liveDistanceM) : '--';
  const displayEta = arrived ? '0 s' : liveEtaSec !== null ? formatDuration(liveEtaSec) : '--';

  return (
    <div className="flex-1 flex flex-col overflow-hidden fade-in">
      {/* ══ Navigation header ══ */}
      {target && (
        <div className={`shrink-0 ${arrived ? 'bg-gradient-to-r from-emerald-600 to-emerald-500' : 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900'} text-white`}>
          {/* Main info */}
          <div className="flex items-center gap-3 px-4 pt-3 pb-2">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${arrived ? 'bg-white/20' : 'bg-blue-600'}`}>
              {arrived ? '✅' : '🚒'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                {arrived ? 'Arrive sur place' : 'En route vers le sinistre'}
              </p>
              <p className="text-[13px] font-semibold truncate mt-0.5">{target.label}</p>
            </div>
          </div>

          {/* Live distance + ETA bar */}
          {!arrived && (
            <div className="flex items-stretch border-t border-white/10">
              <div className="flex-1 text-center py-2.5 border-r border-white/10">
                <p className="text-2xl font-extrabold tracking-tight">{displayEta}</p>
                <p className="text-[9px] uppercase tracking-widest opacity-50 mt-0.5">Temps restant</p>
              </div>
              <div className="flex-1 text-center py-2.5">
                <p className="text-2xl font-extrabold tracking-tight">{displayDistance}</p>
                <p className="text-[9px] uppercase tracking-widest opacity-50 mt-0.5">Distance</p>
              </div>
            </div>
          )}

          {arrived && (
            <div className="text-center pb-3">
              <p className="text-sm font-bold opacity-90">Statut automatiquement mis a jour</p>
            </div>
          )}

          {loadingRoute && (
            <div className="px-4 pb-2">
              <p className="text-[11px] opacity-60 animate-pulse">Calcul de l'itineraire...</p>
            </div>
          )}
        </div>
      )}

      {/* GPS error */}
      {gpsError && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-700 font-medium shrink-0">
          ⚠️ {gpsError}
        </div>
      )}

      {/* ══ MAP ══ */}
      <div className="flex-1 relative">
        {/* Zoom controls */}
        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
          {target && !arrived && (
            <button onClick={() => { fittedRef.current = false; }}
              className="w-10 h-10 rounded-xl shadow-lg flex items-center justify-center text-sm font-bold bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all">
              ⊞
            </button>
          )}
        </div>

        <MapContainer center={center} zoom={target ? 15 : 13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
          <FitRoute route={route} userPos={userPos} done={fittedRef} />
          <FollowDriver userPos={userPos} active={fittedRef.current && !arrived} />
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" attribution="CARTO" />

          {/* Full route (faded background) */}
          {route && !arrived && (
            <Polyline positions={route.coordinates} pathOptions={{ color: '#93c5fd', weight: 6, opacity: 0.3 }} />
          )}

          {/* Remaining route (bright) */}
          {remainingRoute.length > 1 && !arrived && (
            <>
              <Polyline positions={remainingRoute} pathOptions={{ color: '#1e40af', weight: 8, opacity: 0.15 }} />
              <Polyline positions={remainingRoute} pathOptions={{ color: '#3b82f6', weight: 5, opacity: 0.9 }} />
            </>
          )}

          {/* User position — blue pulsing dot */}
          {userPos && (
            <>
              <Circle center={userPos} radius={40}
                pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1, weight: 1, opacity: 0.4 }} />
              <CircleMarker center={userPos} radius={9}
                pathOptions={{ color: '#ffffff', fillColor: '#3b82f6', fillOpacity: 1, weight: 3 }}>
                <Tooltip permanent direction="top" offset={[0, -14]}
                  className="!bg-blue-600 !text-white !border-0 !shadow-lg !rounded-lg !px-2.5 !py-1 !text-[10px] !font-bold">
                  {arrived ? 'Sur place' : displayEta}
                </Tooltip>
              </CircleMarker>
            </>
          )}

          {/* Destination */}
          {target && (
            <>
              <Circle center={[target.lat, target.lng]} radius={ARRIVAL_THRESHOLD_METERS}
                pathOptions={{ color: arrived ? '#22c55e' : '#ef4444', fillColor: arrived ? '#22c55e' : '#ef4444', fillOpacity: 0.06, weight: 1.5, dashArray: arrived ? undefined : '8 6' }} />
              <CircleMarker center={[target.lat, target.lng]} radius={12}
                pathOptions={{ color: arrived ? '#22c55e' : '#ef4444', fillColor: arrived ? '#dcfce7' : '#fee2e2', fillOpacity: 0.9, weight: 3 }}>
                <Tooltip permanent direction="top" offset={[0, -16]}
                  className="!bg-white !border !border-gray-200 !shadow-lg !rounded-xl !px-2.5 !py-1.5 !text-[11px]">
                  <div className="text-center leading-tight">
                    <p className="font-bold" style={{ color: arrived ? '#22c55e' : '#ef4444' }}>
                      {arrived ? '✅ Arrive' : '🎯 Sinistre'}
                    </p>
                    {!arrived && liveDistanceM !== null && (
                      <p className="text-gray-500 text-[9px] mt-0.5">{displayDistance}</p>
                    )}
                  </div>
                </Tooltip>
              </CircleMarker>
            </>
          )}

          {/* Other missions (dimmed) */}
          {missions.filter(m => m.id !== target?.missionId).map(m => {
            const col = statusColors[m.statut] || statusColors.NOUVEAU;
            return (
              <CircleMarker key={m.id} center={[m.lat, m.lng]} radius={6}
                pathOptions={{ color: col.stroke, fillColor: col.fill, fillOpacity: 0.3, weight: 1.5 }}
                eventHandlers={{ click: () => onViewDetails(m.id) }}>
                <Popup>
                  <div className="text-xs min-w-[140px]">
                    <p className="font-bold text-gray-900 text-sm">{m.type_incident}</p>
                    <p className="text-gray-500">📍 {m.adresse}</p>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      {/* ══ Bottom bar ══ */}
      {target && (
        <div className="bg-white border-t border-gray-100 px-4 py-3 shrink-0">
          {arrived ? (
            <div className="text-center">
              <p className="text-emerald-600 font-bold text-sm mb-2">✅ Arrive — Statut synchronise avec le citoyen</p>
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
              <button onClick={() => window.open(`https://waze.com/ul?ll=${target.lat},${target.lng}&navigate=yes`, '_blank')}
                className="flex-1 py-3 bg-[#33ccff] hover:bg-[#28b8e8] text-white rounded-xl font-semibold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-1.5">
                🗺️ Ouvrir Waze
              </button>
            </div>
          )}
        </div>
      )}

      {/* No target */}
      {!target && missions.filter(m => m.statut !== 'TERMINE').length === 0 && (
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
