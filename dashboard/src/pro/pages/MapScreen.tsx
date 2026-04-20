export default function MapScreen() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center fade-in">
      <p className="text-4xl mb-3">🗺️</p>
      <p className="text-lg font-bold text-gray-900 mb-1">Carte GPS</p>
      <p className="text-sm text-gray-500">La navigation GPS s'ouvrira dans votre application de cartes (Waze / Google Maps) lorsque vous cliquerez "Lancer la navigation" depuis une mission.</p>
    </div>
  );
}
