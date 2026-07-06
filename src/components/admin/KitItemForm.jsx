import { useState } from 'react'
import { Save, X, Upload } from 'lucide-react'
import { uploadProductPhoto } from '../../lib/storage.js'
import { supabaseEnabled } from '../../lib/supabase.js'

const inputClass =
  'w-full rounded-xl border-2 border-blush-100 bg-white px-3.5 py-2.5 text-sm text-plum-900 outline-none transition-colors focus:border-blush-400'
const labelClass = 'mb-1 block text-xs font-bold uppercase tracking-wide text-plum-800/60'

export default function KitItemForm({ initial, categories = [], onSave, onCancel }) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [form, setForm] = useState(() => ({
    name: initial?.name || '',
    price: initial?.price ?? 0,
    category: initial?.category || categories[0] || 'Essentials',
    maxQty: initial?.maxQty ?? 6,
    photo: initial?.photo || '',
  }))

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handlePhotoFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    setUploadError('')
    const { url, error } = await uploadProductPhoto(file)
    setUploading(false)
    if (error) {
      setUploadError(error)
      return
    }
    set('photo', url)
  }

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave({
      name: form.name.trim(),
      price: Number(form.price) || 0,
      category: form.category.trim() || 'Essentials',
      maxQty: Math.max(1, Number(form.maxQty) || 6),
      photo: form.photo.trim() || null,
    })
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-3xl bg-blush-50 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Item name</label>
          <input className={inputClass} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Herbal hand sanitizer" required />
        </div>
        <div>
          <label className={labelClass}>Category</label>
          <input
            className={inputClass}
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
            placeholder="Essentials"
            list="kit-item-categories"
          />
          <datalist id="kit-item-categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Price per unit (₹)</label>
          <input type="number" className={inputClass} value={form.price} onChange={(e) => set('price', e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Max quantity a customer can pick</label>
          <input type="number" min="1" className={inputClass} value={form.maxQty} onChange={(e) => set('maxQty', e.target.value)} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Photo (optional)</label>
        <div className="flex items-start gap-3">
          {form.photo && <img src={form.photo} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />}
          <div className="flex-1 space-y-2">
            <input
              className={inputClass}
              value={form.photo}
              onChange={(e) => set('photo', e.target.value)}
              placeholder="/images/... or https://..."
            />
            <div className="flex flex-wrap items-center gap-2">
              <label
                className={`inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-plum-800 shadow-soft transition-colors ${
                  uploading || !supabaseEnabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-blush-100'
                }`}
              >
                <Upload size={12} />
                {uploading ? 'Uploading…' : 'Upload from device'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading || !supabaseEnabled}
                  onChange={handlePhotoFile}
                />
              </label>
              {!supabaseEnabled && (
                <span className="text-xs font-semibold text-plum-800/50">Connect Supabase to enable uploads</span>
              )}
              {uploadError && <span className="text-xs font-semibold text-red-600">{uploadError}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-plum-900 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-blush-600">
          <Save size={15} /> Save item
        </button>
        <button type="button" onClick={onCancel} className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-plum-800 shadow-soft transition-colors hover:bg-blush-100">
          <X size={15} /> Cancel
        </button>
      </div>
    </form>
  )
}
