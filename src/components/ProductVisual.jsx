// Decorative generative art tile used as product imagery.
// Each product gets a palette + motif so cards feel like a curated collection.

const motifs = {
  petal: (c) => (
    <g>
      <path d="M100 148 C 70 130, 62 96, 78 62 C 104 76, 116 112, 100 148 Z" fill={c[2]} opacity="0.85" transform="rotate(-18 100 100)" />
      <path d="M100 148 C 130 130, 138 96, 122 62 C 96 76, 84 112, 100 148 Z" fill={c[2]} opacity="0.55" transform="rotate(14 100 100)" />
      <path d="M100 150 C 100 120, 104 92, 118 68" stroke={c[0]} strokeWidth="5" strokeLinecap="round" fill="none" />
    </g>
  ),
  wave: (c) => (
    <g>
      <path d="M20 118 Q 60 78 100 118 T 180 118 V 170 H 20 Z" fill={c[2]} opacity="0.85" />
      <path d="M20 98 Q 60 58 100 98 T 180 98" fill="none" stroke={c[2]} strokeWidth="7" strokeLinecap="round" opacity="0.5" />
      <circle cx="146" cy="56" r="16" fill={c[2]} opacity="0.9" />
    </g>
  ),
  bloom: (c) => (
    <g>
      {[0, 60, 120, 180, 240, 300].map((r) => (
        <ellipse key={r} cx="100" cy="76" rx="15" ry="30" fill={c[2]} opacity="0.75" transform={`rotate(${r} 100 100)`} />
      ))}
      <circle cx="100" cy="100" r="15" fill={c[0]} />
    </g>
  ),
  sun: (c) => (
    <g>
      <circle cx="100" cy="100" r="34" fill={c[2]} opacity="0.9" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((r) => (
        <rect key={r} x="96" y="38" width="8" height="20" rx="4" fill={c[2]} opacity="0.6" transform={`rotate(${r} 100 100)`} />
      ))}
      <circle cx="100" cy="100" r="18" fill={c[0]} opacity="0.9" />
    </g>
  ),
  leaf: (c) => (
    <g>
      <path d="M100 40 C 150 66 152 128 100 160 C 48 128 50 66 100 40 Z" fill={c[2]} opacity="0.85" />
      <path d="M100 52 V 148 M100 84 L 126 66 M100 84 L 74 66 M100 116 L 130 96 M100 116 L 70 96" stroke={c[0]} strokeWidth="5" strokeLinecap="round" fill="none" />
    </g>
  ),
  drop: (c) => (
    <g>
      <path d="M100 38 C 124 74 142 96 142 122 A 42 42 0 1 1 58 122 C 58 96 76 74 100 38 Z" fill={c[2]} opacity="0.9" />
      <path d="M84 118 A 18 18 0 0 0 100 140" stroke={c[0]} strokeWidth="7" strokeLinecap="round" fill="none" />
    </g>
  ),
  ribbon: (c) => (
    <g>
      <path d="M100 50 C 76 50 68 74 100 90 C 132 74 124 50 100 50 Z" fill={c[2]} opacity="0.9" />
      <path d="M100 90 L 66 150 L 90 144 L 100 162 L 110 144 L 134 150 Z" fill={c[2]} opacity="0.7" />
      <circle cx="100" cy="68" r="8" fill={c[0]} />
    </g>
  ),
  spark: (c) => (
    <g>
      <path d="M100 36 L 112 88 L 164 100 L 112 112 L 100 164 L 88 112 L 36 100 L 88 88 Z" fill={c[2]} opacity="0.88" />
      <circle cx="146" cy="60" r="10" fill={c[2]} opacity="0.6" />
      <circle cx="58" cy="142" r="7" fill={c[0]} opacity="0.8" />
    </g>
  ),
}

export default function ProductVisual({ product, className = '' }) {
  const c = product.palette
  const motif = motifs[product.art] || motifs.petal
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: `linear-gradient(140deg, ${c[0]} 0%, ${c[1]} 100%)` }}
      role="img"
      aria-label={`${product.name} photo`}
    >
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <circle cx="170" cy="26" r="42" fill="#ffffff" opacity="0.35" />
        <circle cx="24" cy="176" r="52" fill="#ffffff" opacity="0.25" />
        {motif(c)}
      </svg>
      {product.photo && (
        <img
          src={product.photo}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      )}
    </div>
  )
}
