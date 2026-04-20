import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Circle, Popup, Polyline, Tooltip, useMap } from 'react-leaflet';
import { mockStats, Alert, Intervention, Team } from '../data/mockData';
import { dashboardSync } from '../lib/dashboardSync';
import 'leaflet/dist/leaflet.css';

interface Props { user: any; onLogout: () => void; }

// ════════════════════════════════════════════
//  TOP BAR
// ════════════════════════════════════════════
function TopBar({ user, onLogout }: { user: any; onLogout: () => void }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const i = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(i); }, []);

  return (
    <header
      className="bg-command-950 text-white h-12 md:h-14 flex items-center px-3 md:px-6 shrink-0"
      style={{
        borderBottom: '1px solid rgba(180,83,9,0.2)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.03), 0 4px 24px rgba(2,6,23,0.8)',
      }}
    >
      <div className="flex items-center gap-2 md:gap-3">
        <div
          className="w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center text-base md:text-lg shrink-0"
          style={{
            background: 'linear-gradient(135deg, #b45309 0%, #d97706 60%, #0891b2 100%)',
            boxShadow: '0 0 16px rgba(180,83,9,0.4)',
          }}
        >
          🚒
        </div>
        <div>
          <span className="font-display font-bold text-[13px] md:text-[15px] tracking-tight text-command-100">GERMS</span>
          <span className="font-body font-normal text-[11px] md:text-[13px] ml-2 hidden sm:inline text-command-600">Centre de Commandement</span>
        </div>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-2 md:gap-5 text-[11px] md:text-[13px]">
        <span className="font-mono hidden md:inline text-command-700">{time.toLocaleTimeString('fr-FR')}</span>
        <div
          className="flex items-center gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-lg"
          style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.25)' }}
        >
          <span className="w-2 h-2 rounded-full pulse-dot" style={{ backgroundColor: '#22d3ee' }} />
          <span className="font-body font-bold text-[10px] md:text-xs hidden sm:inline text-accent-400">EN LIGNE</span>
        </div>
        <div className="h-5 w-px hidden md:block bg-command-800" />
        <div className="items-center gap-2 hidden md:flex">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
            style={{ background: 'rgba(180,83,9,0.2)', border: '1px solid rgba(180,83,9,0.3)', color: '#d97706' }}
          >
            {user.prenoms?.[0]}{user.nom?.[0]}
          </div>
          <span className="font-body text-command-400">{user.prenoms} {user.nom}</span>
          <span className="text-command-800">|</span>
          <span className="font-body text-command-600">CI-Abidjan</span>
        </div>
        <button
          onClick={onLogout}
          className="font-body text-xs font-medium ml-1 text-command-600 hover:text-red-400 transition-colors"
        >
          <span className="hidden sm:inline">Deconnexion</span>
          <span className="sm:hidden">✕</span>
        </button>
      </div>
    </header>
  );
}

// ════════════════════════════════════════════
//  KPI BAR
// ════════════════════════════════════════════
function KpiBar({ stats }: { stats: typeof mockStats }) {
  const kpis = [
    { value: stats.interventions_actives, suffix: '', label: 'Interventions actives', gradStart: '#0891b2', gradEnd: '#38bdf8', iconBg: 'rgba(8,145,178,0.12)', iconBorder: 'rgba(8,145,178,0.25)', icon: '🚒' },
    { value: stats.alertes_en_attente, suffix: '', label: 'Alertes en attente', gradStart: '#b45309', gradEnd: '#f59e0b', iconBg: 'rgba(180,83,9,0.12)', iconBorder: 'rgba(180,83,9,0.25)', icon: '🔔' },
    { value: stats.equipes_disponibles, suffix: '', label: 'Equipes disponibles', gradStart: '#64748b', gradEnd: '#94a3b8', iconBg: 'rgba(100,116,139,0.12)', iconBorder: 'rgba(100,116,139,0.2)', icon: '👥' },
    { value: Math.round(stats.temps_moyen_minutes), suffix: ' min', label: "Temps moyen d'intervention", gradStart: '#059669', gradEnd: '#34d399', iconBg: 'rgba(5,150,105,0.12)', iconBorder: 'rgba(5,150,105,0.25)', icon: '⏱' },
    { value: stats.taux_reussite, suffix: '%', label: 'Taux de reussite', gradStart: '#b45309', gradEnd: '#0891b2', iconBg: 'rgba(180,83,9,0.1)', iconBorder: 'rgba(180,83,9,0.2)', icon: '📊' },
  ];

  return (
    <div
      className="px-3 md:px-6 py-2 md:py-3 shrink-0 bg-command-900"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="flex items-center gap-2 md:gap-3 py-1 group cursor-default">
            <div
              className="w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-sm md:text-lg transition-transform group-hover:scale-110 shrink-0"
              style={{ background: kpi.iconBg, border: `1px solid ${kpi.iconBorder}` }}
            >
              {kpi.icon}
            </div>
            <div className="min-w-0">
              <p
                className="text-lg md:text-2xl font-extrabold count-up leading-none bg-clip-text"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${kpi.gradStart}, ${kpi.gradEnd})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {kpi.value}{kpi.suffix}
              </p>
              <p className="font-body text-[9px] md:text-[11px] mt-0.5 font-medium truncate text-command-700">{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════
//  MAP LEGEND
// ════════════════════════════════════════════
function MapLegend() {
  return (
    <div
      className="absolute top-4 left-4 z-[1000] px-4 py-3 rounded-xl glass"
      style={{ boxShadow: '0 8px 32px rgba(2,6,23,0.6)' }}
    >
      <p className="font-body text-[10px] font-bold uppercase tracking-widest mb-2.5 text-command-600">Legende</p>
      <div className="space-y-2">
        {[
          { color: '#ef4444', label: 'Non pris en charge', ring: true },
          { color: '#22c55e', label: 'En cours', ring: false },
          { color: '#3b82f6', label: 'Terminee', ring: true },
          { color: '#f59e0b', label: 'Alerte en attente', ring: true },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full shrink-0" style={{
              backgroundColor: item.ring ? 'transparent' : item.color,
              border: `2.5px solid ${item.color}`,
              boxShadow: `0 0 0 2px ${item.color}20`,
            }} />
            <span className="font-body text-[11px] font-medium text-command-400">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════
//  TEAM TRACKER (animated)
// ════════════════════════════════════════════
function TeamTracker({ teams }: { teams: Team[] }) {
  const [positions, setPositions] = useState(
    teams.filter(t => t.statut === 'EN_MISSION').map(t => ({ ...t }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setPositions(prev => prev.map(t => ({
        ...t,
        lat: t.lat + (Math.random() - 0.5) * 0.0006,
        lng: t.lng + (Math.random() - 0.5) * 0.0006,
      })));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {positions.map(team => {
        const intv = null; // No mock interventions — team routes will be dynamic
        return (
          <React.Fragment key={`team-${team.id}`}>
            {intv && (
              <Polyline positions={[[team.lat, team.lng], [intv.lat, intv.lng]]}
                pathOptions={{ color: '#10b981', weight: 2.5, dashArray: '10 8', opacity: 0.6 }} />
            )}
            <CircleMarker center={[team.lat, team.lng]} radius={7}
              pathOptions={{ color: '#0891b2', fillColor: '#38bdf8', fillOpacity: 1, weight: 2.5 }}>
              <Tooltip permanent direction="right" offset={[12, 0]}
                className="!bg-slate-900 !border !border-cyan-500/30 !shadow-xl !rounded-xl !px-2.5 !py-1 !text-[11px] !font-bold !text-cyan-300">
                🚒 {intv?.eta_minutes || '?'} min
              </Tooltip>
              <Popup><div className="text-xs"><p className="font-bold text-gray-900">{team.nom}</p><p className="text-gray-500">{team.unite} — {team.type_vehicule}</p></div></Popup>
            </CircleMarker>
          </React.Fragment>
        );
      })}
    </>
  );
}

// ════════════════════════════════════════════
//  STAR RATING
// ════════════════════════════════════════════
function Stars({ score }: { score: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={`text-xs ${i < Math.floor(score) ? 'text-amber-400' : 'text-command-700'}`}>★</span>
      ))}
      <span className="font-body text-[11px] font-semibold ml-1 text-command-600">{score.toFixed(1)}</span>
    </span>
  );
}

// ════════════════════════════════════════════
//  ALERT ITEM (side panel)
// ════════════════════════════════════════════
function AlertItem({ alert, onValidate, onReject, onMerge, onCall, selected, onClick }: {
  alert: Alert; onValidate: (id: string) => void; onReject: (id: string) => void;
  onMerge: (id: string) => void; onCall: (tel: string) => void;
  selected?: boolean; onClick?: () => void;
}) {
  const icons: Record<string, string> = {
    'Incendie': '🔥', 'Accident de route': '🚗', 'Fuite de gaz': '💧',
    'Secours a personne': '🏥', 'Inondation': '🌊', 'Secours à personne': '🏥',
  };
  const time = new Date(alert.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      onClick={onClick}
      className={`py-4 border-b last:border-b-0 fade-in cursor-pointer transition-all rounded-xl px-3 mb-1 ${alert.similar_alert_nearby && !selected ? 'alert-pulse' : ''}`}
      style={selected ? {
        background: 'rgba(180,83,9,0.1)',
        borderColor: 'rgba(180,83,9,0.15)',
        boxShadow: '0 0 0 1.5px rgba(180,83,9,0.3)',
      } : {
        borderColor: 'rgba(148,163,184,0.06)',
        borderLeftWidth: alert.similar_alert_nearby && !selected ? '3px' : undefined,
        borderLeftColor: alert.similar_alert_nearby && !selected ? '#f59e0b' : undefined,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
            style={{ background: 'rgba(180,83,9,0.15)', border: '1px solid rgba(180,83,9,0.3)' }}
          >
            {icons[alert.type_incident] || '⚠️'}
          </div>
          <div>
            <p className="font-body font-bold text-[13px] leading-tight text-command-200">{alert.type_incident}</p>
            <p className="font-mono text-[10px] text-command-700">{alert.code}</p>
          </div>
        </div>
        <span className="badge-pending">{alert.statut === 'PENDING' ? 'En attente' : alert.statut}</span>
      </div>

      {/* Address */}
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-xs text-command-400">📍</span>
        <span className="font-body text-[12px] text-command-500">{alert.adresse}</span>
      </div>

      {/* Citizen */}
      <div
        className="rounded-xl px-3 py-2.5 mb-2.5"
        style={{ background: 'rgba(2,6,23,0.5)', border: '1px solid rgba(148,163,184,0.06)' }}
      >
        <div className="flex items-center justify-between">
          <p className="font-body text-[13px] text-command-400">
            <span className="font-bold text-command-300">{alert.citoyen_nom} {alert.citoyen_prenoms}</span>
            <span className="mx-1.5 text-command-800">—</span>
            <span className="font-medium text-accent-400">{alert.citoyen_telephone}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Stars score={alert.citoyen_reputation} />
          <span className="text-command-800">—</span>
          <span className="font-body text-[11px] text-command-700">{time}</span>
        </div>
      </div>

      {/* Duplicate warning */}
      {alert.similar_alert_nearby && (
        <div
          className="rounded-xl px-3.5 py-2.5 mb-3 flex items-start gap-2"
          style={{
            background: 'rgba(180,83,9,0.08)',
            border: '1px solid rgba(180,83,9,0.3)',
          }}
        >
          <span className="text-sm mt-0.5">⚠️</span>
          <p className="font-body text-[12px] leading-relaxed text-sahel-600">
            Alerte similaire detectee a <strong>{alert.similar_alert_distance}m</strong> — Fusionner avec <strong>{alert.similar_intervention_id}</strong> ?
          </p>
        </div>
      )}

      {/* Actions */}
      {alert.statut === 'PENDING' && (
        <div className="grid grid-cols-4 gap-2">
          <button onClick={() => onValidate(alert.id)} className="btn-outline-green text-[12px]">
            <span>✅</span> Valider
          </button>
          {alert.similar_alert_nearby ? (
            <button onClick={() => onMerge(alert.id)} className="btn-outline-blue text-[12px]">
              <span>🔗</span> Fusionner
            </button>
          ) : (
            <div />
          )}
          <button onClick={() => onReject(alert.id)} className="btn-outline-red text-[12px]">
            <span>✕</span> Rejeter
          </button>
          <button onClick={() => onCall(alert.citoyen_telephone)} className="btn-outline-green text-[12px]">
            <span>📞</span> Appeler
          </button>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════
//  MAP CONTROLLER (fly to location on click)
// ════════════════════════════════════════════
function MapController({ target }: { target: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], 16, { duration: 1.2 });
    }
  }, [target, map]);
  return null;
}

// ════════════════════════════════════════════
//  INTERVENTION ITEM
// ════════════════════════════════════════════
function InterventionItem({ intv, selected, onClick }: { intv: Intervention; selected?: boolean; onClick?: () => void }) {
  const conf: Record<string, { borderColor: string; dotColor: string; labelColor: string; labelBg: string; label: string }> = {
    NOUVEAU: { borderColor: '#ef4444', dotColor: '#ef4444', labelColor: '#fca5a5', labelBg: 'rgba(239,68,68,0.12)', label: 'Nouveau' },
    EN_ROUTE: { borderColor: '#a855f7', dotColor: '#a855f7', labelColor: '#d8b4fe', labelBg: 'rgba(168,85,247,0.12)', label: 'En route' },
    SUR_PLACE: { borderColor: '#f59e0b', dotColor: '#f59e0b', labelColor: '#fcd34d', labelBg: 'rgba(245,158,11,0.12)', label: 'Sur place' },
    TERMINE: { borderColor: '#10b981', dotColor: '#10b981', labelColor: '#6ee7b7', labelBg: 'rgba(16,185,129,0.12)', label: 'Terminee' },
  };
  const icons: Record<string, string> = { 'Incendie': '🔥', 'Accident de route': '🚗', 'Fuite de gaz': '💨', 'Inondation': '🌊', 'Secours à personne': '🏥' };
  const st = conf[intv.statut] || conf.NOUVEAU;

  return (
    <div
      onClick={onClick}
      className="py-3.5 border-b last:border-b-0 transition-all rounded-xl px-3 cursor-pointer fade-in mb-1"
      style={selected ? {
        background: 'rgba(8,145,178,0.1)',
        borderColor: 'rgba(8,145,178,0.15)',
        boxShadow: '0 0 0 1.5px rgba(8,145,178,0.3)',
        borderLeft: `3px solid ${st.borderColor}`,
      } : {
        borderColor: 'rgba(148,163,184,0.06)',
        borderLeft: `3px solid ${st.borderColor}`,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
          style={{ background: 'rgba(2,6,23,0.7)', border: `1px solid ${st.borderColor}30` }}
        >
          {icons[intv.type_incident] || '🚒'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-body font-bold text-[13px] text-command-200">{intv.type_incident}</span>
            <span
              className="px-2 py-0.5 rounded-md text-[10px] font-bold font-body"
              style={{ background: st.labelBg, color: st.labelColor, border: `1px solid ${st.borderColor}30` }}
            >
              {st.label}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-command-700">
            <span className="font-mono">{intv.code}</span>
            {intv.equipe_nom && <><span>—</span><span className="font-body text-command-600">🚒 {intv.equipe_nom}</span></>}
          </div>
        </div>
        {intv.eta_minutes !== null && intv.eta_minutes > 0 && (
          <div className="text-right shrink-0">
            <p className="text-sm font-extrabold text-emerald-400">{intv.eta_minutes} min</p>
            <p className="font-body text-[10px] text-command-700">{intv.distance_km} km</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════
//  TEAM ITEM
// ════════════════════════════════════════════
function TeamItem({ team, selected, onClick }: { team: Team; selected?: boolean; onClick?: () => void }) {
  const dots: Record<string, string> = { DISPONIBLE: '#22c55e', EN_MISSION: '#ef4444', RETOUR_CASERNE: '#38bdf8' };
  const labels: Record<string, string> = { DISPONIBLE: 'Disponible', EN_MISSION: 'En mission', RETOUR_CASERNE: 'Retour' };
  const labelColors: Record<string, string> = { DISPONIBLE: '#4ade80', EN_MISSION: '#fca5a5', RETOUR_CASERNE: '#67e8f9' };

  return (
    <div
      onClick={onClick}
      className="py-3.5 border-b last:border-b-0 transition-all rounded-xl px-3 cursor-pointer fade-in mb-1"
      style={selected ? {
        background: 'rgba(8,145,178,0.1)',
        borderColor: 'rgba(8,145,178,0.15)',
        boxShadow: '0 0 0 1.5px rgba(8,145,178,0.3)',
      } : {
        borderColor: 'rgba(148,163,184,0.06)',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
          style={{ background: 'rgba(180,83,9,0.12)', border: '1px solid rgba(180,83,9,0.25)' }}
        >
          🚒
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-body font-bold text-[13px] text-command-200">{team.nom}</span>
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dots[team.statut], boxShadow: `0 0 6px ${dots[team.statut]}` }} />
            <span className="font-body text-[10px] font-medium" style={{ color: labelColors[team.statut] }}>{labels[team.statut]}</span>
          </div>
          <p className="font-body text-[11px] text-command-700">{team.unite} — {team.type_vehicule} — {team.membres.length} pers.</p>
        </div>
        <Stars score={team.note_moyenne} />
      </div>
    </div>
  );
}

// ════════════════════════════════════════════
//  RAPPORTS SECTION (with period filters + export)
// ════════════════════════════════════════════
type PeriodFilter = 'all' | 'week' | 'month' | 'quarter' | 'semester' | 'year';

function getDateRange(period: PeriodFilter): { from: Date; label: string } {
  const now = new Date();
  switch (period) {
    case 'week': {
      const d = new Date(now); d.setDate(d.getDate() - 7);
      return { from: d, label: 'Hebdomadaire (7 derniers jours)' };
    }
    case 'month': {
      const d = new Date(now); d.setMonth(d.getMonth() - 1);
      return { from: d, label: 'Mensuel (30 derniers jours)' };
    }
    case 'quarter': {
      const d = new Date(now); d.setMonth(d.getMonth() - 3);
      return { from: d, label: 'Trimestriel (3 derniers mois)' };
    }
    case 'semester': {
      const d = new Date(now); d.setMonth(d.getMonth() - 6);
      return { from: d, label: 'Semestriel (6 derniers mois)' };
    }
    case 'year': {
      const d = new Date(now); d.setFullYear(d.getFullYear() - 1);
      return { from: d, label: 'Annuel (12 derniers mois)' };
    }
    default:
      return { from: new Date(0), label: 'Tous les rapports' };
  }
}

const periodFilters: { key: PeriodFilter; label: string; icon: string }[] = [
  { key: 'all', label: 'Tous', icon: '📋' },
  { key: 'week', label: 'Hebdo', icon: '📅' },
  { key: 'month', label: 'Mensuel', icon: '🗓️' },
  { key: 'quarter', label: 'Trimestriel', icon: '📊' },
  { key: 'semester', label: 'Semestriel', icon: '📈' },
  { key: 'year', label: 'Annuel', icon: '🗃️' },
];

function RapportsSection({ rapports }: { rapports: any[] }) {
  const [period, setPeriod] = useState<PeriodFilter>('all');
  const range = getDateRange(period);

  const filtered = rapports.filter(r => {
    if (period === 'all') return true;
    return new Date(r.date) >= range.from;
  });

  const totalVehicules = filtered.reduce((s, r) => s + (r.vehicules || 0), 0);
  const totalPersonnel = filtered.reduce((s, r) => s + (r.personnel || 0), 0);
  const totalVictimes = filtered.reduce((s, r) => s + (r.victimes_total || 0), 0);
  const avgDuree = filtered.length > 0 ? Math.round(filtered.reduce((s, r) => s + (r.duree_minutes || 0), 0) / filtered.length) : 0;

  return (
    <div className="mx-3 mb-4 mt-1">
      <div className="card p-5" style={{ boxShadow: '0 4px 24px rgba(2,6,23,0.4)' }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-3">
          <div>
            <h3 className="font-display text-[15px] font-bold text-command-200">Rapports d'intervention</h3>
            <p className="font-body text-xs mt-0.5 text-command-600">{filtered.length} rapport(s) — {range.label}</p>
          </div>
          {filtered.length > 0 && (
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => exportPDF(filtered, range.label)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold font-body transition-colors"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.25)' }}
                onMouseOver={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.18)')}
                onMouseOut={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
              >
                PDF
              </button>
              <button
                onClick={() => exportExcel(filtered, range.label)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold font-body transition-colors"
                style={{ background: 'rgba(16,185,129,0.1)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.25)' }}
                onMouseOver={e => (e.currentTarget.style.background = 'rgba(16,185,129,0.18)')}
                onMouseOut={e => (e.currentTarget.style.background = 'rgba(16,185,129,0.1)')}
              >
                Excel
              </button>
              <button
                onClick={() => exportWord(filtered, range.label)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold font-body transition-colors"
                style={{ background: 'rgba(8,145,178,0.1)', color: '#67e8f9', border: '1px solid rgba(8,145,178,0.25)' }}
                onMouseOver={e => (e.currentTarget.style.background = 'rgba(8,145,178,0.18)')}
                onMouseOut={e => (e.currentTarget.style.background = 'rgba(8,145,178,0.1)')}
              >
                Word
              </button>
            </div>
          )}
        </div>

        {/* Period filters */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {periodFilters.map(f => (
            <button
              key={f.key}
              onClick={() => setPeriod(f.key)}
              className="px-3 py-2 rounded-xl text-xs font-bold font-body whitespace-nowrap transition-all flex items-center gap-1.5"
              style={period === f.key ? {
                background: 'rgba(180,83,9,0.15)',
                border: '1.5px solid rgba(180,83,9,0.5)',
                color: '#f59e0b',
                boxShadow: '0 0 12px rgba(180,83,9,0.15)',
              } : {
                background: 'rgba(2,6,23,0.5)',
                border: '1.5px solid rgba(148,163,184,0.07)',
                color: '#475569',
              }}
            >
              <span>{f.icon}</span> {f.label}
            </button>
          ))}
        </div>

        {/* Stats summary */}
        {filtered.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            {[
              { value: filtered.length, label: 'Interventions', color: '#38bdf8', bg: 'rgba(8,145,178,0.1)', border: 'rgba(8,145,178,0.2)' },
              { value: totalPersonnel, label: 'Personnel mobilise', color: '#fbbf24', bg: 'rgba(180,83,9,0.1)', border: 'rgba(180,83,9,0.2)' },
              { value: totalVictimes, label: 'Victimes', color: '#fca5a5', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
              { value: `${avgDuree} min`, label: 'Duree moyenne', color: '#6ee7b7', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
            ].map((s, i) => (
              <div key={i} className="rounded-xl p-3 text-center" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                <p className="text-lg font-extrabold font-display" style={{ color: s.color }}>{s.value}</p>
                <p className="font-body text-[10px] font-medium mt-0.5" style={{ color: s.color, opacity: 0.7 }}>{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-3xl mb-3">📋</p>
            <p className="font-body text-sm font-medium text-command-700">Aucun rapport {period !== 'all' ? 'pour cette periode' : 'pour le moment'}</p>
            <p className="font-body text-xs mt-1 text-command-800">Les bilans soumis par les equipes (GERMS Pro) apparaitront ici</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid rgba(148,163,184,0.07)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-command-800">
                  {['Code', 'Type', 'Adresse', 'Equipe', 'Vehic.', 'Pers.', 'Victimes', 'Actions', 'Duree', 'Date'].map((h, i, arr) => (
                    <th
                      key={h}
                      className={`text-left p-3 font-body font-bold text-[10px] uppercase tracking-wider text-command-500 ${i === 0 ? 'rounded-tl-xl' : ''} ${i === arr.length - 1 ? 'rounded-tr-xl text-right' : ''} ${['Vehic.', 'Pers.', 'Victimes', 'Duree'].includes(h) ? 'text-center' : ''}`}
                      style={{ borderBottom: '1px solid rgba(148,163,184,0.07)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr
                    key={i}
                    className="transition-colors"
                    style={{ borderTop: '1px solid rgba(148,163,184,0.05)' }}
                    onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td className="p-3 font-mono text-xs text-command-600">{r.code}</td>
                    <td className="p-3 font-body font-semibold text-command-300">{r.type_incident}</td>
                    <td className="p-3 font-body text-xs max-w-[150px] truncate text-command-600">{r.adresse}</td>
                    <td className="p-3 font-body text-xs text-command-500">
                      {r.equipe}<br />
                      <span className="text-command-700">{r.unite}</span>
                    </td>
                    <td className="p-3 text-center font-bold font-body text-command-400">{r.vehicules}</td>
                    <td className="p-3 text-center font-bold font-body text-command-400">{r.personnel}</td>
                    <td className="p-3 text-center">
                      <span className="font-bold font-body" style={{ color: r.victimes_total > 0 ? '#fca5a5' : '#334155' }}>{r.victimes_total}</span>
                      {r.victimes_deces > 0 && <span className="font-body text-[10px] block text-red-500">{r.victimes_deces} deces</span>}
                    </td>
                    <td className="p-3 text-xs max-w-[200px]">
                      <div className="flex flex-wrap gap-1">
                        {r.actions?.map((a: string, j: number) => (
                          <span
                            key={j}
                            className="px-1.5 py-0.5 rounded font-body text-[10px] font-medium"
                            style={{ background: 'rgba(8,145,178,0.12)', color: '#67e8f9', border: '1px solid rgba(8,145,178,0.2)' }}
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-center font-bold font-body text-command-300">{r.duree_minutes} min</td>
                    <td className="p-3 text-right font-body text-xs text-command-700">{new Date(r.date).toLocaleString('fr-FR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════
//  EXPORT FUNCTIONS (PDF, Excel, Word)
// ════════════════════════════════════════════
function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function exportPDF(rapports: any[], periodLabel: string) {
  const html = `
<!DOCTYPE html><html><head><meta charset="utf-8"><title>Rapports GERMS</title>
<style>body{font-family:Arial,sans-serif;margin:40px;color:#333}h1{color:#dc2626;border-bottom:3px solid #dc2626;padding-bottom:10px}
table{width:100%;border-collapse:collapse;margin-top:20px;font-size:12px}th{background:#1f2937;color:white;padding:10px;text-align:left}
td{padding:8px 10px;border-bottom:1px solid #e5e7eb}.header{display:flex;justify-content:space-between;align-items:center}
.badge{display:inline-block;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:bold;background:#fee2e2;color:#dc2626}
</style></head><body>
<div class="header"><h1>GERMS — Rapports d'Intervention</h1><p>${new Date().toLocaleDateString('fr-FR')} | Cote d'Ivoire | ${periodLabel}</p></div>
<p>${rapports.length} rapport(s) — ${periodLabel}</p>
<table><thead><tr><th>Code</th><th>Type</th><th>Adresse</th><th>Equipe</th><th>Vehic.</th><th>Pers.</th><th>Victimes</th><th>Actions</th><th>Duree</th><th>Date</th></tr></thead><tbody>
${rapports.map(r => `<tr><td>${r.code}</td><td><strong>${r.type_incident}</strong></td><td>${r.adresse}</td><td>${r.equipe}<br><small>${r.unite}</small></td><td style="text-align:center">${r.vehicules}</td><td style="text-align:center">${r.personnel}</td><td style="text-align:center"><strong>${r.victimes_total}</strong>${r.victimes_deces > 0 ? `<br><small style="color:red">${r.victimes_deces} deces</small>` : ''}</td><td>${(r.actions || []).join(', ')}</td><td style="text-align:center"><strong>${r.duree_minutes} min</strong></td><td>${new Date(r.date).toLocaleString('fr-FR')}</td></tr>`).join('')}
</tbody></table>
${rapports.map(r => `
<div style="page-break-before:always;margin-top:30px">
<h2>${r.type_incident} — ${r.code}</h2>
<p><strong>Adresse:</strong> ${r.adresse}</p>
<p><strong>Equipe:</strong> ${r.equipe} (${r.unite}) — Chef: ${r.chef}</p>
<p><strong>Moyens:</strong> ${r.vehicules} vehicule(s), ${r.personnel} personnel</p>
<p><strong>Victimes:</strong> Total ${r.victimes_total} | Deces ${r.victimes_deces} | Graves ${r.victimes_graves} | Legers ${r.victimes_legers} | Indemnes ${r.victimes_indemnes}</p>
<p><strong>Actions:</strong> ${(r.actions || []).join(', ')}</p>
<p><strong>Eau:</strong> ${r.eau_litres} litres</p>
<p><strong>Duree:</strong> ${r.duree_minutes} minutes</p>
<p><strong>Observations:</strong> ${r.observations || 'Aucune'}</p>
</div>`).join('')}
</body></html>`;
  const printWindow = window.open('', '_blank');
  if (printWindow) { printWindow.document.write(html); printWindow.document.close(); printWindow.print(); }
}

function exportExcel(rapports: any[], periodLabel: string) {
  const header = 'Code\tType\tAdresse\tEquipe\tUnite\tChef\tVehicules\tPersonnel\tVictimes Total\tDeces\tGraves\tLegers\tIndemnes\tActions\tEau (L)\tDuree (min)\tObservations\tDate\n';
  const rows = rapports.map(r =>
    `${r.code}\t${r.type_incident}\t${r.adresse}\t${r.equipe}\t${r.unite}\t${r.chef}\t${r.vehicules}\t${r.personnel}\t${r.victimes_total}\t${r.victimes_deces}\t${r.victimes_graves}\t${r.victimes_legers}\t${r.victimes_indemnes}\t${(r.actions || []).join(', ')}\t${r.eau_litres}\t${r.duree_minutes}\t${r.observations || ''}\t${new Date(r.date).toLocaleString('fr-FR')}`
  ).join('\n');
  downloadFile('\uFEFF' + header + rows, `GERMS_Rapports_${new Date().toISOString().slice(0, 10)}.xls`, 'application/vnd.ms-excel;charset=utf-8');
}

function exportWord(rapports: any[], periodLabel: string) {
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><style>body{font-family:Calibri,sans-serif;margin:40px}h1{color:#dc2626}h2{color:#1f2937;border-bottom:2px solid #e5e7eb;padding-bottom:5px}
table{width:100%;border-collapse:collapse}th{background:#f3f4f6;padding:8px;text-align:left;border:1px solid #d1d5db}td{padding:6px 8px;border:1px solid #e5e7eb}
.label{font-weight:bold;color:#6b7280;min-width:120px}</style></head><body>
<h1>GERMS — Rapports d'Intervention</h1>
<p>Date: ${new Date().toLocaleDateString('fr-FR')} | Region: Cote d'Ivoire — Abidjan | ${periodLabel}</p>
<p>${rapports.length} rapport(s)</p><hr>
${rapports.map((r, i) => `
<h2>${i + 1}. ${r.type_incident} — ${r.code}</h2>
<table>
<tr><td class="label">Adresse</td><td>${r.adresse}</td></tr>
<tr><td class="label">Equipe</td><td>${r.equipe} — ${r.unite}</td></tr>
<tr><td class="label">Chef d'intervention</td><td>${r.chef}</td></tr>
<tr><td class="label">Vehicules</td><td>${r.vehicules}</td></tr>
<tr><td class="label">Personnel</td><td>${r.personnel}</td></tr>
<tr><td class="label">Victimes</td><td>Total: ${r.victimes_total} | Deces: ${r.victimes_deces} | Graves: ${r.victimes_graves} | Legers: ${r.victimes_legers} | Indemnes: ${r.victimes_indemnes}</td></tr>
<tr><td class="label">Actions realisees</td><td>${(r.actions || []).join(', ')}</td></tr>
<tr><td class="label">Eau utilisee</td><td>${r.eau_litres} litres</td></tr>
<tr><td class="label">Duree</td><td>${r.duree_minutes} minutes</td></tr>
<tr><td class="label">Observations</td><td>${r.observations || 'Aucune'}</td></tr>
<tr><td class="label">Date</td><td>${new Date(r.date).toLocaleString('fr-FR')}</td></tr>
</table><br>`).join('')}
</body></html>`;
  downloadFile(html, `GERMS_Rapports_${new Date().toISOString().slice(0, 10)}.doc`, 'application/msword');
}

// ════════════════════════════════════════════
//  MAIN COMMAND CENTER
// ════════════════════════════════════════════
export default function CommandCenter({ user, onLogout }: Props) {
  const emptyStats = { interventions_actives: 0, alertes_en_attente: 0, equipes_disponibles: 0, temps_moyen_minutes: 0, taux_reussite: 0 };
  const [stats, setStats] = useState(emptyStats);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [tab, setTab] = useState<'alerts' | 'interventions' | 'teams'>('alerts');
  const [rapports, setRapports] = useState<any[]>([]);
  const [selectedIntvId, setSelectedIntvId] = useState<string | null>(null);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [mapTarget, setMapTarget] = useState<{ lat: number; lng: number } | null>(null);

  const handleIntvClick = useCallback((intv: Intervention) => {
    setSelectedIntvId(prev => prev === intv.id ? null : intv.id);
    setSelectedAlertId(null); setSelectedTeamId(null);
    setMapTarget({ lat: intv.lat, lng: intv.lng });
  }, []);

  const handleAlertClick = useCallback((alert: Alert) => {
    setSelectedAlertId(prev => prev === alert.id ? null : alert.id);
    setSelectedIntvId(null); setSelectedTeamId(null);
    setMapTarget({ lat: alert.lat, lng: alert.lng });
  }, []);

  const handleTeamClick = useCallback((team: Team) => {
    setSelectedTeamId(prev => prev === team.id ? null : team.id);
    setSelectedIntvId(null); setSelectedAlertId(null);
    setMapTarget({ lat: team.lat, lng: team.lng });
  }, []);

  // Stats are now computed from real data
  useEffect(() => {
    setStats({
      interventions_actives: interventions.filter(i => i.statut !== 'TERMINE').length,
      alertes_en_attente: alerts.filter(a => a.statut === 'PENDING').length,
      equipes_disponibles: teams.length,
      temps_moyen_minutes: 0,
      taux_reussite: interventions.length > 0 ? Math.round(interventions.filter(i => i.statut === 'TERMINE').length / interventions.length * 100) : 0,
    });
  }, [alerts, interventions, teams]);

  // ── BroadcastChannel: receive citizen alerts + pro status updates ──
  useEffect(() => {
    console.log('[Dashboard] Listening for sync events...');
    const unsub1 = dashboardSync.on('alert:new', (incoming: Alert) => {
      console.log('[Dashboard] Received alert:new!', incoming.code);
      setAlerts(prev => {
        if (prev.some(a => a.id === incoming.id)) return prev;
        return [incoming, ...prev];
      });
      setStats(s => ({ ...s, alertes_en_attente: s.alertes_en_attente + 1 }));
    });

    // Listen for Pro firefighter status changes → update interventions
    const unsub2 = dashboardSync.on('intervention:status-changed', (p: any) => {
      console.log('[Dashboard] Pro status change:', p.statut);
      setInterventions(prev => prev.map(i =>
        i.id === p.interventionId ? { ...i, statut: p.statut, arrivee_at: p.statut === 'SUR_PLACE' ? new Date().toISOString() : i.arrivee_at, fin_at: p.statut === 'TERMINE' ? new Date().toISOString() : i.fin_at } : i
      ));
    });

    // Listen for bilan reports from Pro
    const unsub3 = dashboardSync.on('bilan:submitted', (bilan: any) => {
      console.log('[Dashboard] Bilan received:', bilan.code);
      setRapports(prev => [bilan, ...prev]);
    });

    // Listen for Pro team registration
    const unsub4 = dashboardSync.on('team:registered', (teamData: any) => {
      console.log('[Dashboard] New team registered:', teamData.nom);
      const newTeam: Team = {
        id: teamData.code || `team-${Date.now()}`, nom: teamData.nom, unite: teamData.unite,
        type_vehicule: teamData.type_vehicule || 'Camion', immatriculation: teamData.immatriculation || '',
        telephone: teamData.telephone || '', code_equipe: teamData.code,
        pays: 'CI', note_moyenne: 0, actif: true,
        lat: 5.34 + (Math.random() - 0.5) * 0.02, lng: -4.01 + (Math.random() - 0.5) * 0.02,
        statut: 'DISPONIBLE' as const,
        membres: teamData.membres || [],
      };
      setTeams(prev => {
        if (prev.some(t => t.id === newTeam.id)) return prev;
        return [...prev, newTeam];
      });
    });

    return () => { unsub1(); unsub2(); unsub3(); unsub4(); };
  }, []);

  const pendingAlerts = alerts.filter(a => a.statut === 'PENDING');

  const handleValidate = useCallback((id: string) => {
    let foundAlert: any = null;
    setAlerts(prev => {
      foundAlert = prev.find(a => a.id === id);
      return prev.map(a => a.id === id ? { ...a, statut: 'VALIDATED' as const } : a);
    });
    setStats(s => ({ ...s, alertes_en_attente: Math.max(0, s.alertes_en_attente - 1), interventions_actives: s.interventions_actives + 1 }));

    const alert = foundAlert;

    // Find the closest available team by distance
    const availableTeams = teams.filter(t => t.statut === 'DISPONIBLE');
    let closestTeam = availableTeams[0] || teams[0] || { id: 'default', nom: 'Equipe', unite: 'GSPM', type_vehicule: 'Camion', note_moyenne: 4.5, lat: 5.34, lng: -4.01, code_equipe: 'EQ-DEFAULT' };

    if (alert && availableTeams.length > 0) {
      let minDist = Infinity;
      for (const t of availableTeams) {
        const dist = Math.sqrt(Math.pow(t.lat - alert.lat, 2) + Math.pow(t.lng - alert.lng, 2));
        if (dist < minDist) { minDist = dist; closestTeam = t; }
      }
    }

    // Calculate distance in km (approximate)
    const distKm = alert ? Math.round(Math.sqrt(Math.pow((closestTeam.lat - alert.lat) * 111, 2) + Math.pow((closestTeam.lng - alert.lng) * 111 * Math.cos(alert.lat * Math.PI / 180), 2)) * 10) / 10 : 3;
    const etaMin = Math.max(1, Math.round(distKm * 2)); // ~2 min per km

    // Mark the team as EN_MISSION
    setTeams(prev => prev.map(t => t.id === closestTeam.id ? { ...t, statut: 'EN_MISSION' as const } : t));

    const intCode = `INT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Send sync events to citizen
    dashboardSync.send('alert:validated', { alertId: id });

    // Team assignment + mission to the CLOSEST team only
    setTimeout(() => {
      dashboardSync.send('team:assigned', {
        nom: closestTeam.nom, unite: closestTeam.unite,
        type_vehicule: closestTeam.type_vehicule,
        note_moyenne: closestTeam.note_moyenne,
        eta_minutes: etaMin, distance_km: distKm,
      });
      const newIntv: Intervention = {
        id: `intv-${Date.now()}`, code: intCode,
        type_incident: alert?.type_incident || 'Urgence',
        priorite: 'HAUTE' as const, statut: 'NOUVEAU' as const,
        source: 'ALERTE', alerte_principale_id: id,
        lat: alert?.lat || 5.34, lng: alert?.lng || -4.01,
        adresse: alert?.adresse || '', equipe_id: closestTeam.id,
        equipe_nom: closestTeam.nom, equipe_unite: closestTeam.unite,
        operateur_id: 'op1', debut_at: new Date().toISOString(),
        arrivee_at: null, fin_at: null, pays: 'CI', bilan: null,
        eta_minutes: etaMin, distance_km: distKm, created_at: new Date().toISOString(),
      };
      setInterventions(prev => [newIntv, ...prev]);
      dashboardSync.send('intervention:created', {
        ...newIntv,
        targetTeamCode: closestTeam.code_equipe,
        description: alert?.description || '',
        citoyen_nom: alert?.citoyen_nom ? `${alert.citoyen_prenoms} ${alert.citoyen_nom}` : undefined,
        citoyen_telephone: alert?.citoyen_telephone,
      });
    }, 1500);
  }, [teams]);

  const handleReject = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, statut: 'REJECTED' as const } : a));
    setStats(s => ({ ...s, alertes_en_attente: Math.max(0, s.alertes_en_attente - 1) }));
    dashboardSync.send('alert:rejected', { alertId: id, motif: 'Fausse alerte' });
  }, []);

  const handleMerge = useCallback((id: string) => setAlerts(prev => prev.map(a => a.id === id ? { ...a, statut: 'DUPLICATE' as const } : a)), []);
  const handleCall = useCallback((tel: string) => window.alert(`Appel vers ${tel} (simulation)`), []);

  const tabs = [
    { key: 'alerts' as const, label: 'Alertes', count: pendingAlerts.length, activeColor: '#f59e0b', activeBg: 'rgba(180,83,9,0.15)', indicatorColor: 'sahel-500' },
    { key: 'interventions' as const, label: 'Interventions', count: interventions.length, activeColor: '#22d3ee', activeBg: 'rgba(8,145,178,0.15)', indicatorColor: 'accent-500' },
    { key: 'teams' as const, label: 'Equipes', count: teams.length, activeColor: '#94a3b8', activeBg: 'rgba(100,116,139,0.15)', indicatorColor: 'command-400' },
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-command-950">
      <TopBar user={user} onLogout={onLogout} />
      <KpiBar stats={stats} />

      {/* Main area — scrollable */}
      <div className="flex-1 overflow-y-auto bg-command-950">
        {/* Map + Side Panel */}
        <div className="flex flex-col lg:flex-row" style={{ minHeight: '400px' }}>
          {/* ── MAP ── */}
          <div
            className="relative m-2 md:m-3 lg:mr-1.5 rounded-2xl overflow-hidden h-[40vh] lg:h-auto lg:flex-1"
            style={{
              border: '1px solid rgba(148,163,184,0.07)',
              boxShadow: '0 4px 32px rgba(2,6,23,0.6)',
            }}
          >
            <MapLegend />
            <MapContainer center={[5.3400, -4.0100]} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
              <MapController target={mapTarget} />
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution="CARTO" />

              {interventions.map(intv => {
                const c: Record<string, { stroke: string; fill: string }> = {
                  NOUVEAU: { stroke: '#ef4444', fill: '#ef444450' },
                  EN_ROUTE: { stroke: '#22c55e', fill: '#22c55e40' },
                  SUR_PLACE: { stroke: '#22c55e', fill: '#22c55e60' },
                  TERMINE: { stroke: '#3b82f6', fill: '#3b82f640' },
                };
                const col = c[intv.statut] || c.NOUVEAU;
                const isSelected = selectedIntvId === intv.id;
                return (
                  <React.Fragment key={`i-${intv.id}`}>
                    <CircleMarker center={[intv.lat, intv.lng]} radius={isSelected ? 24 : 16}
                      pathOptions={{ color: col.stroke, fillColor: col.fill, fillOpacity: isSelected ? 0.8 : 0.5, weight: isSelected ? 5 : 3 }}>
                      <Tooltip permanent direction="top" offset={[0, -20]}
                        className="!bg-slate-900 !border !border-slate-700 !shadow-xl !rounded-xl !px-2.5 !py-1.5 !text-[11px]">
                        <div className="text-center leading-tight">
                          <p className="font-bold" style={{ color: col.stroke }}>{intv.type_incident.split(' ')[0]}</p>
                          <p className="font-mono text-[9px]" style={{ color: '#475569' }}>{intv.code.split('-').pop()}</p>
                        </div>
                      </Tooltip>
                      <Popup>
                        <div className="text-xs min-w-[180px]">
                          <p className="font-bold text-gray-900 text-sm mb-1">{intv.type_incident}</p>
                          <p className="text-gray-500 mb-0.5">📍 {intv.adresse}</p>
                          <p className="text-gray-400 font-mono text-[10px]">{intv.code}</p>
                          {intv.equipe_nom && <p className="text-blue-600 font-semibold mt-1.5">🚒 {intv.equipe_nom}</p>}
                          {intv.eta_minutes !== null && intv.eta_minutes > 0 && <p className="text-emerald-600 font-bold mt-0.5">ETA: {intv.eta_minutes} min</p>}
                        </div>
                      </Popup>
                    </CircleMarker>
                    {intv.statut !== 'TERMINE' && (
                      <Circle center={[intv.lat, intv.lng]} radius={500}
                        pathOptions={{ color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.02, weight: 1.5, dashArray: '8 6' }} />
                    )}
                  </React.Fragment>
                );
              })}

              {pendingAlerts.map(alert => {
                const isSelAlert = selectedAlertId === alert.id;
                return (
                  <CircleMarker key={`a-${alert.id}`} center={[alert.lat, alert.lng]} radius={isSelAlert ? 22 : 14}
                    pathOptions={{ color: '#f59e0b', fillColor: '#fbbf2430', fillOpacity: isSelAlert ? 0.7 : 0.4, weight: isSelAlert ? 5 : 3 }}>
                    <Tooltip permanent direction="top" offset={[0, -18]}
                      className="!bg-slate-900 !border !border-amber-500/40 !shadow-xl !rounded-xl !px-2.5 !py-1.5 !text-[11px]">
                      <div className="text-center leading-tight">
                        <p className="font-bold" style={{ color: '#f59e0b' }}>Alerte</p>
                        <p className="font-mono text-[9px]" style={{ color: '#475569' }}>{alert.code.split('-').pop()}</p>
                      </div>
                    </Tooltip>
                    <Popup>
                      <div className="text-xs min-w-[180px]">
                        <p className="font-bold text-gray-900 text-sm mb-1">🔔 {alert.type_incident}</p>
                        <p className="text-gray-500">📍 {alert.adresse}</p>
                        <p className="text-gray-500 mt-0.5">👤 {alert.citoyen_prenoms} {alert.citoyen_nom}</p>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}

              <TeamTracker teams={teams} />
            </MapContainer>
          </div>

          {/* ── SIDE PANEL ── */}
          <div
            className="w-full lg:w-[440px] m-2 md:m-3 lg:ml-1.5 rounded-2xl flex flex-col shrink-0 overflow-hidden lg:max-h-[60vh] bg-command-900"
            style={{
              border: '1px solid rgba(148,163,184,0.07)',
              boxShadow: '0 4px 32px rgba(2,6,23,0.5)',
            }}
          >
            {/* Tabs */}
            <div
              className="flex px-1 pt-1 shrink-0"
              style={{ borderBottom: '1px solid rgba(148,163,184,0.07)' }}
            >
              {tabs.map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className="flex-1 py-3 font-body text-[13px] font-semibold transition-all rounded-t-lg mx-0.5"
                  style={tab === t.key ? {
                    color: t.activeColor,
                    borderBottom: `2.5px solid ${t.activeColor}`,
                    background: t.activeBg,
                  } : {
                    color: '#334155',
                    borderBottom: '2.5px solid transparent',
                  }}
                >
                  {t.label}
                  <span
                    className="ml-1.5 px-1.5 py-0.5 rounded-md font-body text-[10px] font-bold"
                    style={tab === t.key ? {
                      background: t.activeBg,
                      color: t.activeColor,
                      border: `1px solid ${t.activeColor}40`,
                    } : {
                      background: 'rgba(148,163,184,0.05)',
                      color: '#334155',
                    }}
                  >
                    {t.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-3 py-2">
              {tab === 'alerts' && (
                pendingAlerts.length === 0
                  ? (
                    <div className="flex flex-col items-center justify-center h-40">
                      <p className="text-3xl mb-2">✅</p>
                      <p className="font-body text-sm font-medium text-command-700">Aucune alerte en attente</p>
                    </div>
                  )
                  : pendingAlerts.map(a => (
                    <AlertItem
                      key={a.id} alert={a}
                      onValidate={handleValidate} onReject={handleReject}
                      onMerge={handleMerge} onCall={handleCall}
                      selected={selectedAlertId === a.id}
                      onClick={() => handleAlertClick(a)}
                    />
                  ))
              )}
              {tab === 'interventions' && (
                interventions.length === 0
                  ? (
                    <div className="flex flex-col items-center justify-center h-40">
                      <p className="text-3xl mb-2">🚒</p>
                      <p className="font-body text-sm font-medium text-command-700">Aucune intervention</p>
                    </div>
                  )
                  : interventions.map(i => (
                    <InterventionItem key={i.id} intv={i} selected={selectedIntvId === i.id} onClick={() => handleIntvClick(i)} />
                  ))
              )}
              {tab === 'teams' && (
                teams.length === 0
                  ? (
                    <div className="flex flex-col items-center justify-center h-40">
                      <p className="text-3xl mb-2">👥</p>
                      <p className="font-body text-sm font-medium text-command-700">Aucune equipe connectee</p>
                    </div>
                  )
                  : teams.map(t => (
                    <TeamItem key={t.id} team={t} selected={selectedTeamId === t.id} onClick={() => handleTeamClick(t)} />
                  ))
              )}
            </div>
          </div>
        </div>

        {/* ══════ RAPPORTS D'INTERVENTION ══════ */}
        <RapportsSection rapports={rapports} />
      </div>
    </div>
  );
}
