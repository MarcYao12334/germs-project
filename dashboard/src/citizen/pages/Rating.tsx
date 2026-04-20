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
      {/* Icon */}
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 slide-up"
        style={{
          background: 'linear-gradient(135deg, #fef9f0 0%, #fef3c7 100%)',
          border: '2px solid rgba(180,83,9,0.16)',
          boxShadow: '0 6px 24px rgba(180,83,9,0.14)',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#d97706"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </div>

      <h2
        className="text-xl font-extrabold mb-1 text-center slide-up font-display text-stone-900"
        style={{ animationDelay: '60ms' }}
      >
        Merci pour votre alerte !
      </h2>
      <p
        className="text-sm text-center mb-7 slide-up font-body text-stone-400"
        style={{ animationDelay: '100ms' }}
      >
        L'equipe a confirme l'incident.
      </p>

      {/* Divider */}
      <div
        className="w-12 h-0.5 mb-6 rounded-full"
        style={{ background: 'linear-gradient(90deg, transparent, #d97706, transparent)' }}
      />

      <p className="text-[15px] font-semibold mb-5 text-center font-body text-stone-900">
        Comment s'est passee l'intervention ?
      </p>

      <div className="mb-6">
        <StarRatingInput value={score} onChange={setScore} />
      </div>

      <textarea
        className="input-light min-h-[80px] resize-none mb-6 w-full font-body"
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Commentaire (optionnel)"
      />

      <button
        onClick={handleSubmit}
        disabled={score === 0}
        className="w-full py-4 rounded-xl font-bold text-white text-[15px] transition-all active:scale-[0.97] disabled:opacity-40 font-body bg-gradient-to-r from-sahel-700 to-sahel-600 shadow-sahel"
      >
        Valider la note
      </button>
      <button
        onClick={onDone}
        className="text-sm mt-3 transition-colors hover:opacity-70 font-body text-stone-400"
      >
        Passer
      </button>
    </div>
  );
}
