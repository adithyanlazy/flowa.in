import { Star } from 'lucide-react'

export default function Stars({ rating, size = 14, showValue = false }) {
  return (
    <span className="inline-flex items-center gap-1" aria-label={`Rated ${rating} out of 5`}>
      <span className="inline-flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size}
            className={i <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-blush-100 text-blush-200'}
          />
        ))}
      </span>
      {showValue && <span className="text-sm font-semibold text-plum-800">{rating}</span>}
    </span>
  )
}
