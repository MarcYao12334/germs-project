import { useState } from 'react';

interface Props { value: number; onChange: (v: number) => void; size?: string; }

export default function StarRatingInput({ value, onChange, size = 'text-4xl' }: Props) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1 justify-center">
      {[1, 2, 3, 4, 5].map(i => (
        <button key={i} type="button"
          onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
          className={`${size} transition-transform active:scale-125 ${
            i <= (hover || value) ? 'text-amber-400 drop-shadow-md' : 'text-gray-200'
          }`}>
          ★
        </button>
      ))}
    </div>
  );
}
