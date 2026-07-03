// Larger, place-specific illustrations (distinct from ProductVisual's per-product tiles).

const scenes = {
  story: (
    <g>
      <circle cx="100" cy="60" r="34" fill="#F9A8D4" opacity="0.9" />
      <path d="M56 150 C 56 108 144 108 144 150 Z" fill="#831843" opacity="0.85" />
      <path d="M100 92 C 78 92 66 116 74 140" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M76 40 C 88 26 112 26 124 40 C 130 30 122 16 100 16 C 78 16 70 30 76 40 Z" fill="#500724" />
      <path d="M132 78 C 148 70 160 82 156 98 C 152 112 136 116 128 106" stroke="#8B5CF6" strokeWidth="6" strokeLinecap="round" fill="none" />
      <circle cx="150" cy="86" r="5" fill="#8B5CF6" />
    </g>
  ),
  chat: (
    <g>
      <rect x="34" y="46" width="98" height="68" rx="20" fill="#EC4899" opacity="0.9" />
      <path d="M60 114 L 52 134 L 82 114 Z" fill="#EC4899" opacity="0.9" />
      <circle cx="60" cy="80" r="6" fill="#FDF2F8" />
      <circle cx="83" cy="80" r="6" fill="#FDF2F8" />
      <circle cx="106" cy="80" r="6" fill="#FDF2F8" />
      <rect x="104" y="96" width="70" height="50" rx="16" fill="#8B5CF6" opacity="0.85" />
      <path d="M150 146 L 158 162 L 130 146 Z" fill="#8B5CF6" opacity="0.85" />
      <path d="M120 116 C 132 110 152 110 158 120" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.6" />
    </g>
  ),
  help: (
    <g>
      <circle cx="100" cy="100" r="58" fill="#EC4899" opacity="0.12" />
      <circle cx="100" cy="100" r="40" fill="#EC4899" opacity="0.9" />
      <path
        d="M88 86 C 88 74 112 74 112 86 C 112 96 100 96 100 108"
        stroke="#FFFFFF"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="100" cy="126" r="5" fill="#FFFFFF" />
      <circle cx="46" cy="56" r="9" fill="#8B5CF6" opacity="0.7" />
      <circle cx="156" cy="146" r="7" fill="#F9A8D4" opacity="0.9" />
    </g>
  ),
  empty: (
    <g>
      <path d="M60 130 C 60 96 140 96 140 130 L 132 158 H 68 Z" fill="#F9A8D4" opacity="0.7" />
      <path d="M78 96 C 78 76 122 76 122 96" stroke="#EC4899" strokeWidth="7" strokeLinecap="round" fill="none" />
      <circle cx="100" cy="130" r="10" fill="#831843" opacity="0.6" />
    </g>
  ),
}

export default function SceneArt({ name, className = '', bg = 'linear-gradient(140deg, #fce7f3 0%, #ede9fe 100%)' }) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: bg }} role="img" aria-label={`${name} illustration`}>
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <circle cx="176" cy="24" r="40" fill="#ffffff" opacity="0.3" />
        <circle cx="18" cy="180" r="46" fill="#ffffff" opacity="0.25" />
        {scenes[name] || scenes.help}
      </svg>
    </div>
  )
}
