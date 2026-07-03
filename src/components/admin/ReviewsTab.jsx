import { useState } from 'react'
import { Plus, Save, Trash2, X } from 'lucide-react'
import { useAdmin } from '../../context/AdminContext.jsx'

const inputClass =
  'w-full rounded-xl border-2 border-blush-100 bg-white px-3.5 py-2.5 text-sm text-plum-900 outline-none transition-colors focus:border-blush-400'
const labelClass = 'mb-1 block text-xs font-bold uppercase tracking-wide text-plum-800/60'

function ReviewForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(
    initial || { name: '', location: '', rating: 5, product: '', text: '' },
  )
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  return (
    <div className="space-y-3 rounded-2xl bg-blush-50 p-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Name</label>
          <input className={inputClass} value={form.name} onChange={(e) => set('name', e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Location</label>
          <input className={inputClass} value={form.location} onChange={(e) => set('location', e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Rating</label>
          <input type="number" min="1" max="5" className={inputClass} value={form.rating} onChange={(e) => set('rating', Number(e.target.value))} />
        </div>
      </div>
      <div>
        <label className={labelClass}>Product mentioned</label>
        <input className={inputClass} value={form.product} onChange={(e) => set('product', e.target.value)} />
      </div>
      <div>
        <label className={labelClass}>Review text</label>
        <textarea rows={3} className={`${inputClass} resize-none`} value={form.text} onChange={(e) => set('text', e.target.value)} />
      </div>
      <div className="flex gap-3">
        <button onClick={() => onSave(form)} className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-plum-900 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blush-600">
          <Save size={14} /> Save
        </button>
        <button onClick={onCancel} className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-plum-800 shadow-soft transition-colors hover:bg-blush-100">
          <X size={14} /> Cancel
        </button>
      </div>
    </div>
  )
}

export default function ReviewsTab() {
  const { reviews, setReviews } = useAdmin()
  const [editingIdx, setEditingIdx] = useState(null)
  const [adding, setAdding] = useState(false)

  const update = (idx, patch) => setReviews(reviews.map((r, i) => (i === idx ? patch : r)))
  const remove = (idx) => setReviews(reviews.filter((_, i) => i !== idx))

  return (
    <div className="space-y-4">
      {!adding && (
        <button onClick={() => setAdding(true)} className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-plum-900 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blush-600">
          <Plus size={15} /> Add review
        </button>
      )}
      {adding && (
        <ReviewForm
          onSave={(r) => {
            setReviews([...reviews, r])
            setAdding(false)
          }}
          onCancel={() => setAdding(false)}
        />
      )}
      <div className="space-y-3">
        {reviews.map((r, i) => (
          <div key={i} className="rounded-3xl bg-white p-4 shadow-soft">
            {editingIdx === i ? (
              <ReviewForm
                initial={r}
                onSave={(patch) => {
                  update(i, patch)
                  setEditingIdx(null)
                }}
                onCancel={() => setEditingIdx(null)}
              />
            ) : (
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-bold text-plum-900">{r.name} · {r.location} · {r.rating}★</p>
                  <p className="text-xs text-plum-800/50">{r.product}</p>
                  <p className="mt-1 text-sm text-plum-800/70">{r.text}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditingIdx(i)} className="cursor-pointer rounded-full bg-blush-100 px-4 py-2 text-sm font-bold text-blush-700 transition-colors hover:bg-blush-200">
                    Edit
                  </button>
                  <button onClick={() => remove(i)} aria-label="Delete review" className="grid h-9 w-9 cursor-pointer place-items-center rounded-full text-plum-800/50 transition-colors hover:bg-red-50 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
