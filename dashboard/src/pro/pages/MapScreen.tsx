export default function MapScreen() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center fade-in">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5 shadow-xl shadow-black/40"
        style={{
          background: 'linear-gradient(135deg, #0d1a2e 0%, #151f2e 100%)',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <span
          className="text-slate-500 text-2xl font-mono"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
        >
          [C]
        </span>
      </div>
      <p
        className="text-lg font-bold text-white mb-2 font-display"
        style={{ fontFamily: 'Sora, sans-serif' }}
      >
        Carte GPS
      </p>
      <p
        className="text-sm text-slate-500 max-w-[280px] leading-relaxed font-body"
        style={{ fontFamily: 'Manrope, sans-serif' }}
      >
        La navigation GPS s'ouvrira dans votre application de cartes (Waze / Google Maps) lorsque vous cliquerez "Lancer la navigation" depuis une mission.
      </p>
    </div>
  );
}
