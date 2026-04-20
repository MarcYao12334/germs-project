import { useState } from 'react';
import { Mission } from '../lib/data';

interface BilanData {
  missionId: string;
  code: string;
  type_incident: string;
  adresse: string;
  equipe: string;
  unite: string;
  chef: string;
  vehicules: number;
  personnel: number;
  victimes_total: number;
  victimes_deces: number;
  victimes_graves: number;
  victimes_legers: number;
  victimes_indemnes: number;
  actions: string[];
  eau_litres: number;
  duree_minutes: number;
  observations: string;
  date: string;
}

interface Props {
  mission: Mission;
  onSubmit: (bilan: BilanData) => void;
  onSkip: () => void;
  team?: { nom: string; unite: string; chef: string; chef_grade: string; membres_count: number };
}

const actionOptions = [
  'Extinction incendie', 'Ventilation', 'Desincarceration', 'Secours a victime',
  'Premiers soins', 'Evacuation', 'Pompage', 'Coupure gaz', 'Coupure electricite',
  'Securisation perimetre', 'Balisage', 'Recherche de personnes',
];

export default function BilanForm({ mission, onSubmit, onSkip, team }: Props) {
  const [vehicules, setVehicules] = useState(1);
  const [personnel, setPersonnel] = useState(team?.membres_count || 4);
  const [victimesTotal, setVictimesTotal] = useState(0);
  const [deces, setDeces] = useState(0);
  const [graves, setGraves] = useState(0);
  const [legers, setLegers] = useState(0);
  const [indemnes, setIndemnes] = useState(0);
  const [actions, setActions] = useState<string[]>([]);
  const [eauLitres, setEauLitres] = useState(0);
  const [observations, setObservations] = useState('');
  const [sending, setSending] = useState(false);

  const toggleAction = (a: string) => {
    setActions(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  };

  const duree = mission.created_at
    ? Math.round((Date.now() - new Date(mission.created_at).getTime()) / 60000)
    : 0;

  const handleSubmit = () => {
    setSending(true);
    const bilan: BilanData = {
      missionId: mission.id, code: mission.code,
      type_incident: mission.type_incident, adresse: mission.adresse,
      equipe: team?.nom || 'Equipe', unite: team?.unite || 'Unite', chef: `${team?.chef_grade || 'Lt.'} ${team?.chef || 'Chef'}`,
      vehicules, personnel,
      victimes_total: victimesTotal, victimes_deces: deces,
      victimes_graves: graves, victimes_legers: legers, victimes_indemnes: indemnes,
      actions, eau_litres: eauLitres,
      duree_minutes: duree, observations,
      date: new Date().toISOString(),
    };
    setTimeout(() => { setSending(false); onSubmit(bilan); }, 600);
  };

  const Counter = ({ label, value, onChange, min = 0 }: { label: string; value: number; onChange: (v: number) => void; min?: number }) => (
    <div
      className="flex items-center justify-between rounded-xl px-3 py-2.5"
      style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)' }}
    >
      <span
        className="text-sm text-slate-300 font-body"
        style={{ fontFamily: 'Manrope, sans-serif' }}
      >
        {label}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-8 h-8 rounded-lg text-slate-300 font-bold flex items-center justify-center active:scale-95 transition-all hover:bg-white/5"
          style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          &#x2212;
        </button>
        <span
          className="w-8 text-center font-bold text-white font-mono"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
        >
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="w-8 h-8 rounded-lg text-white font-bold flex items-center justify-center active:scale-95 transition-all shadow-md shadow-cyan-900/20"
          style={{ background: 'linear-gradient(180deg, #0891b2 0%, #0e7490 100%)' }}
        >
          &#x2B;
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto fade-in">
      {/* Header */}
      <div
        className="text-white p-5"
        style={{ background: 'linear-gradient(135deg, #052e1a 0%, #064e3b 50%, #065f46 100%)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
      >
        <h2
          className="font-bold text-lg font-display"
          style={{ fontFamily: 'Sora, sans-serif' }}
        >
          Bilan d'intervention
        </h2>
        <p
          className="text-xs text-emerald-400 mt-0.5 font-mono"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
        >
          {mission.code} &mdash; {mission.type_incident}
        </p>
        <p
          className="text-xs text-emerald-500/60 mt-0.5 font-body"
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          &#x25B6; {mission.adresse}
        </p>
      </div>

      <div className="p-5 space-y-5">
        {/* Moyens */}
        <div>
          <p
            className="text-[10px] font-bold text-slate-600 mb-2 tracking-widest uppercase font-body"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            Moyens mobilises
          </p>
          <div className="space-y-2">
            <Counter label="Vehicules" value={vehicules} onChange={setVehicules} min={1} />
            <Counter label="Personnel" value={personnel} onChange={setPersonnel} min={1} />
          </div>
        </div>

        {/* Victimes */}
        <div>
          <p
            className="text-[10px] font-bold text-slate-600 mb-2 tracking-widest uppercase font-body"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            Victimes
          </p>
          <div className="space-y-2">
            <Counter label="Total victimes" value={victimesTotal} onChange={setVictimesTotal} />
            {victimesTotal > 0 && (
              <>
                <Counter label="Deces" value={deces} onChange={setDeces} />
                <Counter label="Blesses graves" value={graves} onChange={setGraves} />
                <Counter label="Blesses legers" value={legers} onChange={setLegers} />
                <Counter label="Indemnes" value={indemnes} onChange={setIndemnes} />
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div>
          <p
            className="text-[10px] font-bold text-slate-600 mb-2 tracking-widest uppercase font-body"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            Actions realisees
          </p>
          <div className="flex flex-wrap gap-2">
            {actionOptions.map(a => (
              <button
                key={a}
                type="button"
                onClick={() => toggleAction(a)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all active:scale-[0.97] font-body ${
                  actions.includes(a)
                    ? 'border-accent-600/60 bg-accent-600/10 text-accent-400'
                    : 'text-slate-500 hover:border-white/15 hover:text-slate-400'
                }`}
                style={{
                  background: actions.includes(a) ? undefined : '#1e293b',
                  borderColor: actions.includes(a) ? undefined : 'rgba(255,255,255,0.08)',
                  fontFamily: 'Manrope, sans-serif',
                }}
              >
                {actions.includes(a) ? '&#x2713; ' : ''}{a}
              </button>
            ))}
          </div>
        </div>

        {/* Ressources */}
        <div>
          <p
            className="text-[10px] font-bold text-slate-600 mb-2 tracking-widest uppercase font-body"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            Ressources
          </p>
          <Counter label="Eau utilisee (litres)" value={eauLitres} onChange={setEauLitres} />
        </div>

        {/* Duree */}
        <div
          className="rounded-2xl p-3.5 flex items-center justify-between"
          style={{ background: 'rgba(8,145,178,0.07)', border: '1px solid rgba(8,145,178,0.18)' }}
        >
          <span
            className="text-sm text-accent-400 font-semibold font-body"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            Duree totale
          </span>
          <span
            className="text-lg font-extrabold text-accent-300 font-mono"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: '#67e8f9' }}
          >
            {duree} min
          </span>
        </div>

        {/* Observations */}
        <div>
          <p
            className="text-[10px] font-bold text-slate-600 mb-2 tracking-widest uppercase font-body"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            Observations
          </p>
          <textarea
            className="input-field w-full min-h-[80px] resize-none font-body"
            value={observations}
            onChange={e => setObservations(e.target.value)}
            placeholder="Commentaires, difficultes, points notables..."
            style={{ fontFamily: 'Manrope, sans-serif' }}
          />
        </div>

        {/* Chef */}
        <div
          className="rounded-2xl p-3.5"
          style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <p
            className="text-[10px] text-slate-600 mb-0.5 font-body"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            Chef d'intervention
          </p>
          <p
            className="text-sm font-bold text-slate-200 font-display"
            style={{ fontFamily: 'Sora, sans-serif' }}
          >
            {team?.chef_grade || 'Lt.'} {team?.chef || 'Chef'}
          </p>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={sending}
          className="w-full py-3.5 rounded-2xl font-bold text-[15px] text-white shadow-lg shadow-emerald-900/20 transition-all active:scale-[0.97] disabled:opacity-50 font-display"
          style={{ background: 'linear-gradient(180deg, #059669 0%, #047857 100%)', fontFamily: 'Sora, sans-serif' }}
        >
          {sending ? 'Enregistrement...' : 'ENREGISTRER LE BILAN'}
        </button>
        <button
          onClick={onSkip}
          className="w-full text-sm text-slate-600 text-center py-2 hover:text-slate-400 transition-colors font-body"
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          Passer
        </button>
      </div>
    </div>
  );
}
