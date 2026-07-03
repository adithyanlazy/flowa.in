// Deterministic illustrated avatar from a name — same palette system as ProductVisual.

const palettes = [
  ['#fce7f3', '#f9a8d4', '#ec4899'],
  ['#ede9fe', '#c4b5fd', '#8b5cf6'],
  ['#ffe4e6', '#fda4af', '#e11d48'],
  ['#fef3c7', '#fcd34d', '#f59e0b'],
  ['#dcfce7', '#86efac', '#22c55e'],
  ['#e0f2fe', '#7dd3fc', '#0ea5e9'],
]

function hash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h
}

export default function Avatar({ name, size = 44 }) {
  const h = hash(name)
  const c = palettes[h % palettes.length]
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full"
      style={{ width: size, height: size, background: `linear-gradient(135deg, ${c[0]}, ${c[1]})` }}
      role="img"
      aria-label={name}
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <circle cx={20 + (h % 30)} cy={18 + (h % 20)} r="26" fill="#ffffff" opacity="0.3" />
      </svg>
      <span
        className="absolute inset-0 grid place-items-center font-display font-bold"
        style={{ color: c[2], fontSize: size * 0.36 }}
      >
        {initials}
      </span>
    </div>
  )
}
