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
    <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
      <span className="text-sm text-gray-700">{label}</span>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} className="w-8 h-8 rounded-lg bg-gray-200 text-gray-700 font-bold flex items-center justify-center active:scale-95">-</button>
        <span className="w-8 text-center font-bold text-gray-900">{value}</span>
        <button type="button" onClick={() => onChange(value + 1)} className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center active:scale-95">+</button>
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto fade-in">
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white p-5">
        <h2 className="font-bold text-lg">Bilan d'intervention</h2>
        <p className="text-xs text-emerald-200">{mission.code} — {mission.type_incident}</p>
        <p className="text-xs text-emerald-200 mt-0.5">📍 {mission.adresse}</p>
      </div>

      <div className="p-5 space-y-5">
        {/* Moyens */}
        <div>
          <p className="text-xs font-bold text-gray-500 mb-2">MOYENS MOBILISES</p>
          <div className="space-y-2">
            <Counter label="Vehicules" value={vehicules} onChange={setVehicules} min={1} />
            <Counter label="Personnel" value={personnel} onChange={setPersonnel} min={1} />
          </div>
        </div>

        {/* Victimes */}
        <div>
          <p className="text-xs font-bold text-gray-500 mb-2">VICTIMES</p>
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
          <p className="text-xs font-bold text-gray-500 mb-2">ACTIONS REALISEES</p>
          <div className="flex flex-wrap gap-2">
            {actionOptions.map(a => (
              <button key={a} type="button" onClick={() => toggleAction(a)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all ${
                  actions.includes(a) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 bg-white'
                }`}>
                {actions.includes(a) ? '✓ ' : ''}{a}
              </button>
            ))}
          </div>
        </div>

        {/* Ressources */}
        <div>
          <p className="text-xs font-bold text-gray-500 mb-2">RESSOURCES</p>
          <Counter label="Eau utilisee (litres)" value={eauLitres} onChange={setEauLitres} />
        </div>

        {/* Duree */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 flex items-center justify-between">
          <span className="text-sm text-blue-700 font-semibold">Duree totale</span>
          <span className="text-lg font-extrabold text-blue-800">{duree} min</span>
        </div>

        {/* Observations */}
        <div>
          <p className="text-xs font-bold text-gray-500 mb-2">OBSERVATIONS</p>
          <textarea className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 min-h-[80px] resize-none"
            value={observations} onChange={e => setObservations(e.target.value)} placeholder="Commentaires, difficultes, points notables..." />
        </div>

        {/* Chef */}
        <div className="bg-gray-50 rounded-2xl p-3">
          <p className="text-xs text-gray-400 mb-0.5">Chef d'intervention</p>
          <p className="text-sm font-bold text-gray-900">{team?.chef_grade || 'Lt.'} {team?.chef || 'Chef'}</p>
        </div>

        {/* Submit */}
        <button onClick={handleSubmit} disabled={sending}
          className="w-full py-3.5 bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-2xl font-bold text-[15px] shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] disabled:opacity-50">
          {sending ? 'Enregistrement...' : '📋 ENREGISTRER LE BILAN'}
        </button>
        <button onClick={onSkip} className="w-full text-sm text-gray-400 text-center py-2">Passer</button>
      </div>
    </div>
  );
}
