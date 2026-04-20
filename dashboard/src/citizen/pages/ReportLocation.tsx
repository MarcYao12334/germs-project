import { useState, useEffect } from 'react';

interface Props { onNext: (loc: { lat: number; lng: number; adresse: string }) => void; onBack: () => void; }

export default function ReportLocation({ onNext, onBack }: Props) {
  const [tab, setTab] = useState<'gps' | 'manual'>('gps');
  const [loading, setLoading] = useState(false);
  const [gpsResult, setGpsResult] = useState<{ lat: number; lng: number; adresse: string } | null>(null);
  const [manualAddress, setManualAddress] = useState('');
  const [error, setError] = useState('');

  const handleGPS = () => {
    setLoading(true); setError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
          const data = await res.json();
          setGpsResult({ lat, lng, adresse: data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
        } catch {
          setGpsResult({ lat, lng, adresse: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
        }
        setLoading(false);
      },
      () => { setError('Impossible d\'acceder au GPS. Essayez la saisie manuelle.'); setLoading(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => { if (tab === 'gps') handleGPS(); }, [tab]);

  const handleManualSearch = async () => {
    if (!manualAddress.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(manualAddress)}&format=json&limit=1`);
      const data = await res.json();
      if (data[0]) {
        setGpsResult({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), adresse: data[0].display_name });
      } else { setError('Adresse non trouvee'); }
    } catch { setError('Erreur de recherche'); }
    setLoading(false);
  };

  return (
    <div className="flex-1 flex flex-col p-5 fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg">←</button>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Localisation</h2>
          <p className="text-xs text-gray-500">Etape 1/3 — Ou se trouve l'urgence ?</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        <button onClick={() => setTab('gps')} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === 'gps' ? 'bg-red-500 text-white shadow-md' : 'bg-gray-100 text-gray-500'}`}>📍 Ma position GPS</button>
        <button onClick={() => setTab('manual')} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === 'manual' ? 'bg-red-500 text-white shadow-md' : 'bg-gray-100 text-gray-500'}`}>📝 Saisir une adresse</button>
      </div>

      {tab === 'gps' ? (
        <div className="flex-1 flex flex-col">
          {loading && <div className="flex-1 flex items-center justify-center"><p className="text-gray-400 animate-pulse text-lg">📡 Recherche GPS...</p></div>}
          {error && <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-600 mb-4">{error}</div>}
          {gpsResult && !loading && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-4 slide-up">
              <p className="text-xs text-emerald-600 font-semibold mb-1">📍 Position detectee</p>
              <p className="text-sm text-gray-700">{gpsResult.adresse}</p>
              <p className="text-[10px] text-gray-400 mt-1">GPS: {gpsResult.lat.toFixed(5)}, {gpsResult.lng.toFixed(5)}</p>
            </div>
          )}
          <div className="flex-1" />
          <button onClick={() => gpsResult && onNext(gpsResult)} disabled={!gpsResult} className="btn-primary disabled:opacity-50">Continuer</button>
          <button onClick={handleGPS} className="btn-secondary mt-2">🔄 Relocaliser</button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <input className="input-field mb-3" value={manualAddress} onChange={e => setManualAddress(e.target.value)} placeholder="12 Rue de Rivoli, Paris 75004" />
          <button onClick={handleManualSearch} disabled={loading || !manualAddress.trim()} className="btn-secondary mb-4 disabled:opacity-50">
            {loading ? 'Recherche...' : '🔍 Rechercher l\'adresse'}
          </button>
          {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
          {gpsResult && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-4 slide-up">
              <p className="text-xs text-emerald-600 font-semibold mb-1">📍 Adresse trouvee</p>
              <p className="text-sm text-gray-700">{gpsResult.adresse}</p>
            </div>
          )}
          <div className="flex-1" />
          <button onClick={() => gpsResult && onNext(gpsResult)} disabled={!gpsResult} className="btn-primary disabled:opacity-50">Continuer</button>
        </div>
      )}
    </div>
  );
}
