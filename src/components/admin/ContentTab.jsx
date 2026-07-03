import { useRef, useState } from 'react'
import { Save, Trash2, Upload } from 'lucide-react'
import { defaultSiteContent, useAdmin } from '../../context/AdminContext.jsx'

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

function HeroImageEditor() {
  const { content, setSiteContent } = useAdmin()
  const fileRef = useRef(null)
  const [error, setError] = useState('')

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file')
      return
    }
    if (file.size > 3 * 1024 * 1024) {
      setError('Image is too large — keep it under 3MB')
      return
    }
    setError('')
    const reader = new FileReader()
    reader.onload = () => setSiteContent({ heroImage: reader.result })
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const remove = () => setSiteContent({ heroImage: defaultSiteContent.heroImage })

  return (
    <div className="rounded-3xl bg-white p-5 shadow-soft">
      <p className={labelClass}>Hero background image</p>
      <div className="mt-2 flex flex-wrap items-center gap-4">
        <img src={content.heroImage} alt="Current hero background" className="h-24 w-32 rounded-2xl object-cover shadow-soft" />
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => fileRef.current?.click()}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-plum-900 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blush-600"
          >
            <Upload size={14} /> Upload new image
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          {content.heroImage !== defaultSiteContent.heroImage && (
            <button
              onClick={remove}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-red-50 px-5 py-2.5 text-sm font-bold text-red-700 transition-colors hover:bg-red-100"
            >
              <Trash2 size={14} /> Remove & reset to default
            </button>
          )}
        </div>
      </div>
      {error && <p className="mt-2 text-sm font-semibold text-red-600">{error}</p>}
      <p className="mt-3 text-xs text-plum-800/50">Applies immediately — no need to hit "Save changes" below.</p>
    </div>
  )
}

export default function ContentTab() {
  const { content, setSiteContent } = useAdmin()
  const [form, setForm] = useState(content)
  const [saved, setSaved] = useState(false)

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }))
    setSaved(false)
  }

  const save = () => {
    // only persist the plain-text fields here — heroImage is applied
    // immediately by HeroImageEditor and must not be clobbered by stale form state
    const patch = Object.fromEntries(fields.map((f) => [f.key, form[f.key]]))
    setSiteContent(patch)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-4">
      <HeroImageEditor />
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
    </div>
  )
}
