import { useRef, useState } from 'react'
import { Image as ImageIcon, Plus, Save, Trash2, Upload, Video as VideoIcon } from 'lucide-react'
import { defaultHeroSlides, useAdmin } from '../../context/AdminContext.jsx'

const inputClass =
  'w-full rounded-xl border-2 border-blush-100 bg-white px-3.5 py-2.5 text-sm text-plum-900 outline-none transition-colors focus:border-blush-400'
const labelClass = 'mb-1 block text-xs font-bold uppercase tracking-wide text-plum-800/60'
const MAX_SLIDES = 5

const fields = [
  { key: 'announcement', label: 'Top announcement bar', type: 'text' },
  { key: 'trustBadge', label: 'Hero trust badge text', type: 'text' },
  { key: 'reviewsBlurb', label: 'Reviews blurb under stars', type: 'text' },
  { key: 'instagramUrl', label: 'Instagram profile URL', type: 'text' },
  { key: 'finalCtaTitle', label: 'Bottom CTA headline', type: 'textarea' },
  { key: 'aboutTitle', label: 'Our Story: headline', type: 'textarea' },
  { key: 'aboutBody', label: 'Our Story: body text', type: 'textarea' },
  { key: 'footerTagline', label: 'Footer tagline', type: 'textarea' },
  { key: 'whatsappNumber', label: 'WhatsApp number (digits, country code)', type: 'text' },
  { key: 'contactPhone', label: 'Contact phone (display)', type: 'text' },
  { key: 'contactEmail', label: 'Contact email', type: 'text' },
]

// localStorage caps out around 5-10MB per origin, shared across every admin key —
// a raw multi-MB photo as base64 can single-handedly blow that budget and make
// every *other* save silently fail too. Downscale + re-encode so it stays tiny.
function compressImage(file, maxWidth = 1600, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not load image'))
    }
    img.src = url
  })
}

// Videos can't be downscaled like images, so just cap the raw upload size —
// large enough for a short muted background loop, small enough to not blow
// the shared localStorage/Supabase row budget.
function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.readAsDataURL(file)
  })
}

function tabClass(active) {
  return `rounded-full px-4 py-2 text-xs font-bold transition-colors ${
    active ? 'bg-plum-900 text-white' : 'bg-blush-50 text-plum-800/60'
  }`
}

function SlideEditor({ slide, index, canRemove, onChange, onRemove }) {
  const imageRef = useRef(null)
  const videoRef = useRef(null)
  const [error, setError] = useState('')
  const [videoMode, setVideoMode] = useState(slide.mediaSrc?.startsWith('data:') ? 'upload' : 'url')

  const set = (patch) => onChange({ ...slide, ...patch })

  const handleImageFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return setError('Please choose an image file')
    if (file.size > 3 * 1024 * 1024) return setError('Image is too large — keep it under 3MB')
    setError('')
    try {
      set({ mediaType: 'image', mediaSrc: await compressImage(file) })
    } catch {
      setError('Could not process that image — try a different file')
    }
    e.target.value = ''
  }

  const handleVideoFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('video/')) return setError('Please choose a video file')
    if (file.size > 12 * 1024 * 1024) return setError('Video is too large — keep it under 12MB')
    setError('')
    try {
      set({ mediaType: 'video', mediaSrc: await readFileAsDataUrl(file) })
    } catch {
      setError('Could not process that video — try a different file')
    }
    e.target.value = ''
  }

  return (
    <div className="space-y-4 rounded-3xl bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wide text-plum-800/60">Slide {index + 1}</p>
        {canRemove && (
          <button
            onClick={onRemove}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 transition-colors hover:bg-red-100"
          >
            <Trash2 size={12} /> Remove slide
          </button>
        )}
      </div>

      <div>
        <p className={labelClass}>Background media</p>
        <div className="mt-1 flex gap-2">
          <button onClick={() => set({ mediaType: 'image' })} className={`inline-flex items-center gap-1.5 ${tabClass(slide.mediaType !== 'video')}`}>
            <ImageIcon size={13} /> Image
          </button>
          <button onClick={() => set({ mediaType: 'video' })} className={`inline-flex items-center gap-1.5 ${tabClass(slide.mediaType === 'video')}`}>
            <VideoIcon size={13} /> Video
          </button>
        </div>
      </div>

      {slide.mediaType === 'video' ? (
        <div>
          <div className="flex gap-2">
            <button onClick={() => setVideoMode('upload')} className={tabClass(videoMode === 'upload')}>
              Upload file
            </button>
            <button onClick={() => setVideoMode('url')} className={tabClass(videoMode === 'url')}>
              Video URL
            </button>
          </div>
          <div className="mt-2">
            {videoMode === 'upload' ? (
              <>
                <button
                  onClick={() => videoRef.current?.click()}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-plum-900 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blush-600"
                >
                  <Upload size={14} /> Upload video
                </button>
                <input ref={videoRef} type="file" accept="video/*" onChange={handleVideoFile} className="hidden" />
              </>
            ) : (
              <input
                className={inputClass}
                placeholder="https://example.com/video.mp4"
                value={slide.mediaSrc?.startsWith('data:') ? '' : slide.mediaSrc || ''}
                onChange={(e) => set({ mediaType: 'video', mediaSrc: e.target.value })}
              />
            )}
          </div>
          {slide.mediaSrc && <video src={slide.mediaSrc} className="mt-3 h-24 w-40 rounded-2xl object-cover shadow-soft" muted playsInline />}
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-4">
          <img src={slide.mediaSrc} alt="" className="h-24 w-32 rounded-2xl object-cover shadow-soft" />
          <button
            onClick={() => imageRef.current?.click()}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-plum-900 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blush-600"
          >
            <Upload size={14} /> Upload image
          </button>
          <input ref={imageRef} type="file" accept="image/*" onChange={handleImageFile} className="hidden" />
        </div>
      )}
      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

      <div>
        <label className={labelClass}>Title (start)</label>
        <input className={inputClass} value={slide.titlePrefix} onChange={(e) => set({ titlePrefix: e.target.value })} />
      </div>
      <div>
        <label className={labelClass}>Title (highlighted word)</label>
        <input className={inputClass} value={slide.titleHighlight} onChange={(e) => set({ titleHighlight: e.target.value })} />
      </div>
      <div>
        <label className={labelClass}>Subtitle</label>
        <textarea rows={2} className={`${inputClass} resize-none`} value={slide.subtitle} onChange={(e) => set({ subtitle: e.target.value })} />
      </div>
      <p className="text-xs text-plum-800/50">Applies immediately — no need to hit "Save changes" below.</p>
    </div>
  )
}

function HeroSlidesEditor() {
  const { content, setSiteContent } = useAdmin()
  const slides = content.heroSlides || []

  const updateSlide = (i, next) => setSiteContent({ heroSlides: slides.map((s, idx) => (idx === i ? next : s)) })
  const removeSlide = (i) => setSiteContent({ heroSlides: slides.filter((_, idx) => idx !== i) })
  const addSlide = () => {
    if (slides.length >= MAX_SLIDES) return
    setSiteContent({
      heroSlides: [
        ...slides,
        {
          id: `slide-${Date.now()}`,
          mediaType: 'image',
          mediaSrc: defaultHeroSlides[0].mediaSrc,
          titlePrefix: 'New slide title ',
          titleHighlight: 'here',
          subtitle: 'Slide description goes here.',
        },
      ],
    })
  }

  return (
    <div className="space-y-4">
      <p className={labelClass}>Hero slides ({slides.length}/{MAX_SLIDES})</p>
      {slides.map((s, i) => (
        <SlideEditor
          key={s.id}
          slide={s}
          index={i}
          canRemove={slides.length > 1}
          onChange={(next) => updateSlide(i, next)}
          onRemove={() => removeSlide(i)}
        />
      ))}
      <button
        onClick={addSlide}
        disabled={slides.length >= MAX_SLIDES}
        className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-plum-900 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-blush-600 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus size={15} /> Add slide
      </button>
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
    // only persist the plain-text fields here — hero slides are applied
    // immediately by HeroSlidesEditor and must not be clobbered by stale form state
    const patch = Object.fromEntries(fields.map((f) => [f.key, form[f.key]]))
    setSiteContent(patch)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-4">
      <HeroSlidesEditor />
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
