import { useState } from 'react'
import { Save } from 'lucide-react'
import { useAdmin } from '../../context/AdminContext.jsx'

const inputClass =
  'w-full rounded-xl border-2 border-blush-100 bg-white px-3.5 py-2.5 text-sm text-plum-900 outline-none transition-colors focus:border-blush-400'
const labelClass = 'mb-1 block text-xs font-bold uppercase tracking-wide text-plum-800/60'

const fields = [
  { key: 'announcement', label: 'Top announcement bar', type: 'text' },
  { key: 'heroTitlePrefix', label: 'Hero title (start)', type: 'text' },
  { key: 'heroTitleHighlight', label: 'Hero title (highlighted word)', type: 'text' },
  { key: 'heroSubtitle', label: 'Hero subtitle', type: 'textarea' },
  { key: 'trustBadge', label: 'Hero trust badge text', type: 'text' },
  { key: 'reviewsBlurb', label: 'Reviews blurb under stars', type: 'text' },
  { key: 'finalCtaTitle', label: 'Bottom CTA headline', type: 'textarea' },
  { key: 'aboutTitle', label: 'Our Story: headline', type: 'textarea' },
  { key: 'aboutBody', label: 'Our Story: body text', type: 'textarea' },
  { key: 'footerTagline', label: 'Footer tagline', type: 'textarea' },
  { key: 'whatsappNumber', label: 'WhatsApp number (digits, country code)', type: 'text' },
  { key: 'contactPhone', label: 'Contact phone (display)', type: 'text' },
  { key: 'contactEmail', label: 'Contact email', type: 'text' },
]

export default function ContentTab() {
  const { content, setSiteContent } = useAdmin()
  const [form, setForm] = useState(content)
  const [saved, setSaved] = useState(false)

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }))
    setSaved(false)
  }

  const save = () => {
    setSiteContent(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-4 rounded-3xl bg-white p-5 shadow-soft">
      {fields.map((f) => (
        <div key={f.key}>
          <label className={labelClass}>{f.label}</label>
          {f.type === 'textarea' ? (
            <textarea rows={2} className={`${inputClass} resize-none`} value={form[f.key]} onChange={(e) => set(f.key, e.target.value)} />
          ) : (
            <input className={inputClass} value={form[f.key]} onChange={(e) => set(f.key, e.target.value)} />
          )}
        </div>
      ))}
      <div className="flex items-center gap-3 pt-2">
        <button onClick={save} className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-plum-900 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-blush-600">
          <Save size={15} /> Save changes
        </button>
        {saved && <span className="text-sm font-bold text-emerald-600">Saved ✓</span>}
      </div>
    </div>
  )
}
