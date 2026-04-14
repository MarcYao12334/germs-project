import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Circle, Popup, Polyline, useMap } from 'react-leaflet';
import { mockInterventions, mockAlerts, mockTeams } from '../data/mockData';
import 'leaflet/dist/leaflet.css';

const statusColors: Record<string, string> = {
  NOUVEAU: '#ef4444', EN_ROUTE: '#a855f7', SUR_PLACE: '#f97316', TERMINE: '#3b82f6',
};
const alertColor = '#eab308';

function MapLegend() {
  return (
    <div className="absolute bottom-4 left-4 z-[1000] card p-3">
      <p className="text-[10px] font-semibold text-gray-300 mb-1.5">Légende</p>
      <div className="space-y-1">
        {[
          { color: '#ef4444', label: 'Sinistre non pris en charge' },
          { color: '#22c55e', label: 'Intervention en cours' },
          { color: '#3b82f6', label: 'Intervention terminée' },
          { color: '#eab308', label: 'Alerte en attente' },
          { color: '#f97316', label: 'Équipe (position)' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-[10px] text-gray-400">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamTracker() {
  const map = useMap();
  const [positions, setPositions] = useState(mockTeams.filter(t => t.statut === 'EN_MISSION').map(t => ({ ...t })));

  // Simulate movement
  useEffect(() => {
    const interval = setInterval(() => {
      setPositions(prev => prev.map(t => ({
        ...t,
        lat: t.lat + (Math.random() - 0.5) * 0.001,
        lng: t.lng + (Math.random() - 0.5) * 0.001,
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {positions.map(team => (
        <CircleMarker key={`team-${team.id}`} center={[team.lat, team.lng]} radius={8}
          pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.9, weight: 2 }}>
          <Popup>
            <div className="text-xs">
              <p className="font-bold">🚒 {team.nom}</p>
              <p>{team.unite}</p>
              <p>{team.type_vehicule} — {team.immatriculation}</p>
              <p className="mt-1">Statut: En mission</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
}

export default function MapView() {
  const [showAlerts, setShowAlerts] = useState(true);
  const [showInterventions, setShowInterventions] = useState(true);
  const [showTeams, setShowTeams] = useState(true);
  const [showCoverage, setShowCoverage] = useState(true);

  const activeInterventions = mockInterventions.filter(i => i.statut !== 'TERMINE');
  const pendingAlerts = mockAlerts.filter(a => a.statut === 'PENDING');

  return (
    <div className="h-[calc(100vh-48px)] relative">
      {/* Controls */}
      <div className="absolute top-3 right-3 z-[1000] card p-2.5">
        <p className="text-[10px] font-semibold text-gray-300 mb-2">Couches</p>
        {[
          { key: 'alerts', label: 'Alertes', checked: showAlerts, onChange: setShowAlerts, color: 'text-amber-400' },
          { key: 'interventions', label: 'Interventions', checked: showInterventions, onChange: setShowInterventions, color: 'text-red-400' },
          { key: 'teams', label: 'Équipes', checked: showTeams, onChange: setShowTeams, color: 'text-orange-400' },
          { key: 'coverage', label: 'Zones couverture', checked: showCoverage, onChange: setShowCoverage, color: 'text-blue-400' },
        ].map(layer => (
          <label key={layer.key} className="flex items-center gap-2 text-[11px] text-gray-400 cursor-pointer mb-1">
            <input type="checkbox" checked={layer.checked} onChange={e => layer.onChange(e.target.checked)} className="rounded" />
            <span className={layer.color}>{layer.label}</span>
          </label>
        ))}
      </div>

      <MapLegend />

      <MapContainer center={[48.8600, 2.3300]} zoom={13} style={{ height: '100%', width: '100%' }}
        zoomControl={true}>
        <TileLayer
          attribution='&copy; <a href="https://carto.com">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Pending alerts - yellow animated */}
        {showAlerts && pendingAlerts.map(alert => (
          <CircleMarker key={`alert-${alert.id}`} center={[alert.lat, alert.lng]} radius={10}
            pathOptions={{ color: alertColor, fillColor: alertColor, fillOpacity: 0.6, weight: 2 }}>
            <Popup>
              <div className="text-xs">
                <p className="font-bold">🔔 {alert.type_incident}</p>
                <p>{alert.adresse}</p>
                <p className="mt-1">{alert.code}</p>
                <p>Signalé par: {alert.citoyen_prenoms} {alert.citoyen_nom}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Interventions */}
        {showInterventions && mockInterventions.map(intv => {
          const color = intv.statut === 'TERMINE' ? '#3b82f6' : intv.statut === 'NOUVEAU' ? '#ef4444' : '#22c55e';
          return (
            <CircleMarker key={`intv-${intv.id}`} center={[intv.lat, intv.lng]} radius={8}
              pathOptions={{ color, fillColor: color, fillOpacity: 0.7, weight: 2 }}>
              <Popup>
                <div className="text-xs">
                  <p className="font-bold">🚒 {intv.type_incident}</p>
                  <p>{intv.adresse}</p>
                  <p>{intv.code} — {intv.statut}</p>
                  {intv.equipe_nom && <p>Équipe: {intv.equipe_nom}</p>}
                  {intv.eta_minutes !== null && intv.eta_minutes > 0 && <p>ETA: {intv.eta_minutes} min</p>}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* Coverage circles */}
        {showCoverage && activeInterventions.map(intv => (
          <Circle key={`cov-${intv.id}`} center={[intv.lat, intv.lng]} radius={500}
            pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.05, weight: 1, dashArray: '5 5' }} />
        ))}

        {/* Team positions */}
        {showTeams && <TeamTracker />}
      </MapContainer>
    </div>
  );
}
