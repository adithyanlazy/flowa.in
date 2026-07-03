export default function LogoMark({ className = 'h-9 w-9' }) {
  return (
    <svg viewBox="0 0 240 240" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="flowaRing" x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#cf5678" />
          <stop offset="50%" stopColor="#e79cac" />
          <stop offset="100%" stopColor="#f8e8ea" />
        </linearGradient>
        <linearGradient id="flowaHair" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#dd8598" />
          <stop offset="100%" stopColor="#b85a6c" />
        </linearGradient>
        <linearGradient id="flowaFace" x1="20%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#dd8598" />
          <stop offset="100%" stopColor="#8a3a48" />
        </linearGradient>
        <linearGradient id="petalLight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#eec1c8" />
          <stop offset="100%" stopColor="#dc8ea0" />
        </linearGradient>
        <linearGradient id="petalMid" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e090a0" />
          <stop offset="100%" stopColor="#bd5f70" />
        </linearGradient>
        <linearGradient id="petalDark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9c4655" />
          <stop offset="100%" stopColor="#722e3a" />
        </linearGradient>
      </defs>

      <circle cx="120" cy="120" r="98" fill="none" stroke="url(#flowaRing)" strokeWidth="4" />

      {/* hair: paisley swoosh over the crown */}
      <path
        d="M120 66
           C 104 50 80 46 64 58
           C 50 68 44 86 50 102
           C 42 108 38 120 44 130
           C 38 138 40 150 50 155
           C 58 159 66 155 68 146
           C 62 140 60 130 66 122
           C 60 116 60 104 68 96
           C 66 88 70 78 80 72
           C 92 64 108 62 120 66 Z"
        fill="url(#flowaHair)"
      />

      {/* face profile, facing right */}
      <path
        d="M116 66
           C 130 66 140 76 141 90
           L 158 104
           L 136 112
           L 146 118
           L 138 122
           L 146 127
           L 128 138
           L 120 148
           C 108 152 100 156 100 168
           C 100 174 104 179 110 181
           C 128 187 142 201 145 218
           C 146 224 142 228 136 228
           C 118 229 100 222 88 208
           C 76 194 72 174 78 155
           C 72 151 68 144 68 136
           C 68 128 72 121 78 116
           C 74 110 74 102 78 96
           C 84 78 100 66 116 66 Z"
        fill="url(#flowaFace)"
      />

      {/* heart accent, floating right of face */}
      <path
        d="M182 96
           C 177 88 166 90 164 100
           C 162 90 151 88 146 96
           C 141 105 147 115 164 126
           C 181 115 187 105 182 96 Z"
        fill="url(#petalMid)"
      />

      {/* lotus flower fan, bottom right */}
      <g>
        <path d="M140 210 C 132 186 142 160 165 148 C 173 172 165 198 140 210 Z" fill="url(#petalLight)" />
        <path d="M140 212 C 152 188 178 178 200 188 C 190 210 166 220 140 212 Z" fill="url(#petalLight)" />
        <path d="M140 210 C 133 184 112 166 88 164 C 93 190 113 210 140 210 Z" fill="url(#petalDark)" />
        <path d="M140 214 C 146 190 170 178 194 184 C 188 205 166 218 140 214 Z" fill="url(#petalMid)" />
        <path d="M140 217 C 121 206 108 186 112 164 C 132 171 146 191 140 217 Z" fill="url(#petalDark)" />
      </g>
    </svg>
  )
}
