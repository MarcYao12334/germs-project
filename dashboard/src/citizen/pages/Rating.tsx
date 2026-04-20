import { useState } from 'react';
import StarRatingInput from '../components/StarRatingInput';
import { ActiveAlert } from '../types';

export default function Rating({ activeAlert, onDone }: { activeAlert: ActiveAlert | null; onDone: () => void }) {
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    // In production would send to backend
    onDone();
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 fade-in">
      <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-3xl mb-4">✔️</div>
      <h2 className="text-xl font-extrabold text-gray-900 mb-1">Merci pour votre alerte !</h2>
      <p className="text-sm text-gray-500 text-center mb-6">L'equipe a confirme l'incident.</p>

      <p className="text-[15px] font-semibold text-gray-800 mb-4">Comment s'est passee l'intervention ?</p>

      <div className="mb-6">
        <StarRatingInput value={score} onChange={setScore} />
      </div>

      <textarea className="input-field min-h-[80px] resize-none mb-6 w-full" value={comment} onChange={e => setComment(e.target.value)} placeholder="Commentaire (optionnel)" />

      <button onClick={handleSubmit} disabled={score === 0} className="btn-primary disabled:opacity-50">
        Valider la note
      </button>
      <button onClick={onDone} className="text-sm text-gray-400 mt-3">Passer</button>
    </div>
  );
}
