import { useState } from 'react';

export default function StarRating({ value, onChange, readOnly = false, size = 'md' }) {
  const [hovered, setHovered] = useState(0);
  const sz = size === 'lg' ? 'text-2xl' : 'text-lg';

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          className={`${sz} transition-transform ${!readOnly && 'hover:scale-110 cursor-pointer'}`}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          onClick={() => !readOnly && onChange && onChange(star)}
        >
          {(hovered || value) >= star ? '⭐' : '☆'}
        </button>
      ))}
    </div>
  );
}
