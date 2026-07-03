import { defaultTheme, useAdmin } from '../../context/AdminContext.jsx'

const swatches = [
  { key: '--color-blush-500', label: 'Primary (blush pink)', hint: 'Buttons, prices, accents' },
  { key: '--color-plum-900', label: 'Ink (headings, dark buttons)', hint: 'Headlines, footer, primary CTA' },
  { key: '--color-lav-500', label: 'Accent (lavender)', hint: 'Wishlist badge, secondary accents' },
]

export default function ThemeTab() {
  const { theme, setThemeColor } = useAdmin()

  return (
    <div className="space-y-6 rounded-3xl bg-white p-5 shadow-soft">
      <p className="text-sm text-plum-800/60">
        Changes apply live across the whole site and are saved in this browser.
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        {swatches.map((s) => (
          <div key={s.key} className="rounded-2xl bg-blush-50 p-4">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-plum-800/60">{s.label}</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={theme[s.key]}
                onChange={(e) => setThemeColor({ [s.key]: e.target.value })}
                className="h-11 w-16 cursor-pointer rounded-lg border-2 border-white"
              />
              <span className="font-mono text-sm text-plum-900">{theme[s.key]}</span>
            </div>
            <p className="mt-2 text-xs text-plum-800/50">{s.hint}</p>
          </div>
        ))}
      </div>
      <button
        onClick={() => swatches.forEach((s) => setThemeColor({ [s.key]: defaultTheme[s.key] }))}
        className="cursor-pointer rounded-full bg-blush-100 px-5 py-2.5 text-sm font-bold text-blush-700 transition-colors hover:bg-blush-200"
      >
        Reset colors to default
      </button>
    </div>
  )
}
