import { useState } from 'react';

interface Props { value: number; onChange: (v: number) => void; size?: string; }

export default function StarRatingInput({ value, onChange, size = 'text-4xl' }: Props) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-2 justify-center">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
          className={`${size} transition-all duration-150 active:scale-125 hover:scale-110`}
          style={{
            color: i <= (hover || value) ? '#e88c30' : '#e7e5e4',
            filter: i <= (hover || value) ? 'drop-shadow(0 2px 6px rgba(232,140,48,0.40))' : 'none',
            transform: i <= (hover || value) ? 'translateY(-1px)' : 'translateY(0)',
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
}
