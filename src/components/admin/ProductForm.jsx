import { useState } from 'react'
import { Save, X } from 'lucide-react'

const artOptions = ['petal', 'wave', 'bloom', 'sun', 'leaf', 'drop', 'ribbon', 'spark']
const stockOptions = [
  { value: 'in', label: 'In stock' },
  { value: 'preorder', label: 'Pre-order' },
  { value: 'out', label: 'Out of stock' },
]

const inputClass =
  'w-full rounded-xl border-2 border-blush-100 bg-white px-3.5 py-2.5 text-sm text-plum-900 outline-none transition-colors focus:border-blush-400'
const labelClass = 'mb-1 block text-xs font-bold uppercase tracking-wide text-plum-800/60'

function toLines(arr) {
  return (arr || []).join('\n')
}
function fromLines(text) {
  return text.split('\n').map((l) => l.trim()).filter(Boolean)
}

export default function ProductForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(() => ({
    id: initial?.id || '',
    name: initial?.name || '',
    tagline: initial?.tagline || '',
    category: initial?.category || 'Kits',
    price: initial?.price ?? 0,
    mrp: initial?.mrp ?? 0,
    rating: initial?.rating ?? 4.8,
    reviewCount: initial?.reviewCount ?? 0,
    stock: initial?.stock || 'in',
    badge: initial?.badge || '',
    photo: initial?.photo || '',
    art: initial?.art || 'petal',
    palette: initial?.palette || ['#fce7f3', '#f9a8d4', '#ec4899'],
    contentsText: toLines(initial?.contents),
    description: initial?.description || '',
    benefitsText: toLines(initial?.benefits),
  }))

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const setPalette = (i, v) =>
    setForm((f) => ({ ...f, palette: f.palette.map((c, idx) => (idx === i ? v : c)) }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    const patch = {
      name: form.name.trim(),
      tagline: form.tagline.trim(),
      category: form.category.trim() || 'Kits',
      price: Number(form.price) || 0,
      mrp: Number(form.mrp) || 0,
      rating: Number(form.rating) || 0,
      reviewCount: Number(form.reviewCount) || 0,
      stock: form.stock,
      badge: form.badge.trim() || null,
      photo: form.photo.trim() || null,
      art: form.art,
      palette: form.palette,
      contents: fromLines(form.contentsText),
      description: form.description.trim(),
      benefits: fromLines(form.benefitsText),
    }
    if (!initial?.id) {
      patch.id = form.id.trim() || form.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }
    onSave(patch)
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-3xl bg-blush-50 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Name</label>
          <input className={inputClass} value={form.name} onChange={(e) => set('name', e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Category</label>
          <input className={inputClass} value={form.category} onChange={(e) => set('category', e.target.value)} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Tagline</label>
        <input className={inputClass} value={form.tagline} onChange={(e) => set('tagline', e.target.value)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div>
          <label className={labelClass}>Price (₹)</label>
          <input type="number" className={inputClass} value={form.price} onChange={(e) => set('price', e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>MRP (₹)</label>
          <input type="number" className={inputClass} value={form.mrp} onChange={(e) => set('mrp', e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Rating</label>
          <input type="number" step="0.1" min="0" max="5" className={inputClass} value={form.rating} onChange={(e) => set('rating', e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Review count</label>
          <input type="number" className={inputClass} value={form.reviewCount} onChange={(e) => set('reviewCount', e.target.value)} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Stock status</label>
          <select className={inputClass} value={form.stock} onChange={(e) => set('stock', e.target.value)}>
            {stockOptions.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Badge (optional)</label>
          <input className={inputClass} value={form.badge} onChange={(e) => set('badge', e.target.value)} placeholder="Bestseller" />
        </div>
        <div>
          <label className={labelClass}>Art motif (fallback)</label>
          <select className={inputClass} value={form.art} onChange={(e) => set('art', e.target.value)}>
            {artOptions.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Photo URL</label>
        <input className={inputClass} value={form.photo} onChange={(e) => set('photo', e.target.value)} placeholder="/images/products/my-photo.jpg" />
      </div>

      <div>
        <label className={labelClass}>Fallback palette (light / mid / accent)</label>
        <div className="flex gap-3">
          {form.palette.map((c, i) => (
            <input key={i} type="color" value={c} onChange={(e) => setPalette(i, e.target.value)} className="h-10 w-14 cursor-pointer rounded-lg border-2 border-blush-100" />
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea rows={3} className={`${inputClass} resize-none`} value={form.description} onChange={(e) => set('description', e.target.value)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Contents (one per line)</label>
          <textarea rows={4} className={`${inputClass} resize-none`} value={form.contentsText} onChange={(e) => set('contentsText', e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Benefits (one per line)</label>
          <textarea rows={4} className={`${inputClass} resize-none`} value={form.benefitsText} onChange={(e) => set('benefitsText', e.target.value)} />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-plum-900 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-blush-600">
          <Save size={15} /> Save product
        </button>
        <button type="button" onClick={onCancel} className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-plum-800 shadow-soft transition-colors hover:bg-blush-100">
          <X size={15} /> Cancel
        </button>
      </div>
    </form>
  )
}
