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
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-[0.97] bg-stone-100 text-stone-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div>
          <h2 className="text-lg font-bold font-display text-stone-900">
            Localisation
          </h2>
          <p className="text-xs font-body text-stone-400">
            Etape 1/3 — Ou se trouve l'urgence ?
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-5 p-1 rounded-xl bg-stone-100">
        <button
          onClick={() => setTab('gps')}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 font-body"
          style={{
            background: tab === 'gps' ? '#b45309' : 'transparent',
            color: tab === 'gps' ? '#fff' : '#78716c',
            boxShadow: tab === 'gps' ? '0 2px 10px rgba(180,83,9,0.25)' : 'none',
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3m0 14v3M2 12h3m14 0h3" />
          </svg>
          Ma position GPS
        </button>
        <button
          onClick={() => setTab('manual')}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 font-body"
          style={{
            background: tab === 'manual' ? '#b45309' : 'transparent',
            color: tab === 'manual' ? '#fff' : '#78716c',
            boxShadow: tab === 'manual' ? '0 2px 10px rgba(180,83,9,0.25)' : 'none',
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
          Saisir une adresse
        </button>
      </div>

      {tab === 'gps' ? (
        <div className="flex-1 flex flex-col">
          {loading && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center animate-pulse"
                style={{ background: 'rgba(180,83,9,0.10)' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="2" />
                  <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
                </svg>
              </div>
              <p className="text-sm font-medium animate-pulse font-body" style={{ color: '#b45309' }}>
                Recherche GPS...
              </p>
            </div>
          )}
          {error && (
            <div
              className="rounded-2xl p-4 text-sm mb-4 font-body"
              style={{
                background: '#fef2f2',
                border: '1px solid rgba(220,38,38,0.18)',
                color: '#dc2626',
              }}
            >
              {error}
            </div>
          )}
          {gpsResult && !loading && (
            <div
              className="rounded-2xl p-4 mb-4 slide-up"
              style={{
                background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                border: '1.5px solid rgba(8,145,178,0.18)',
              }}
            >
              <p className="text-xs font-semibold mb-1 flex items-center gap-1.5 font-body" style={{ color: '#0891b2' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Position detectee
              </p>
              <p className="text-sm font-body text-stone-900">{gpsResult.adresse}</p>
              <p className="text-[10px] mt-1 font-mono text-stone-400">
                {gpsResult.lat.toFixed(5)}, {gpsResult.lng.toFixed(5)}
              </p>
            </div>
          )}
          <div className="flex-1" />
          <button
            onClick={() => gpsResult && onNext(gpsResult)}
            disabled={!gpsResult}
            className="w-full py-4 rounded-xl font-bold text-white text-[15px] transition-all active:scale-[0.97] disabled:opacity-40 mb-2 font-body bg-gradient-to-r from-sahel-700 to-sahel-600 shadow-sahel"
          >
            Continuer
          </button>
          <button
            onClick={handleGPS}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.97] font-body bg-stone-100 text-stone-500 border border-stone-200"
          >
            Relocaliser
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <input
            className="input-light mb-3 font-body"
            value={manualAddress}
            onChange={e => setManualAddress(e.target.value)}
            placeholder="12 Rue de Rivoli, Paris 75004"
          />
          <button
            onClick={handleManualSearch}
            disabled={loading || !manualAddress.trim()}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.97] disabled:opacity-40 mb-4 flex items-center justify-center gap-2 font-body bg-stone-100 text-stone-500 border border-stone-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            {loading ? 'Recherche...' : "Rechercher l'adresse"}
          </button>
          {error && (
            <p className="text-sm mb-2 font-body" style={{ color: '#ef4444' }}>{error}</p>
          )}
          {gpsResult && (
            <div
              className="rounded-2xl p-4 mb-4 slide-up"
              style={{
                background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                border: '1.5px solid rgba(8,145,178,0.18)',
              }}
            >
              <p className="text-xs font-semibold mb-1 flex items-center gap-1.5 font-body" style={{ color: '#0891b2' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Adresse trouvee
              </p>
              <p className="text-sm font-body text-stone-900">{gpsResult.adresse}</p>
            </div>
          )}
          <div className="flex-1" />
          <button
            onClick={() => gpsResult && onNext(gpsResult)}
            disabled={!gpsResult}
            className="w-full py-4 rounded-xl font-bold text-white text-[15px] transition-all active:scale-[0.97] disabled:opacity-40 font-body bg-gradient-to-r from-sahel-700 to-sahel-600 shadow-sahel"
          >
            Continuer
          </button>
        </div>
      )}
    </div>
  );
}
