import { useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useAdmin } from '../../context/AdminContext.jsx'
import { formatINR } from '../../data/products.js'
import KitItemForm from './KitItemForm.jsx'

export default function KitBuilderTab() {
  const { kitItems, addKitItem, updateKitItem, deleteKitItem } = useAdmin()
  const [editingId, setEditingId] = useState(null)
  const [adding, setAdding] = useState(false)

  const categories = useMemo(() => [...new Set(kitItems.map((k) => k.category))], [kitItems])

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-white p-5 shadow-soft">
        <h3 className="font-display text-lg text-plum-900">Customize Your Day — item catalog</h3>
        <p className="mt-1 text-sm text-plum-800/60">
          These are the individual items customers can mix, match and pick quantities of to build their own kit at{' '}
          <span className="font-bold">/customize</span>. Kept separate from your regular products — nothing here shows up in the shop.
        </p>
      </div>

      {!adding && (
        <button
          onClick={() => setAdding(true)}
          className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-plum-900 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blush-600"
        >
          <Plus size={15} /> Add item
        </button>
      )}

      {adding && (
        <KitItemForm
          categories={categories}
          onSave={(item) => {
            addKitItem(item)
            setAdding(false)
          }}
          onCancel={() => setAdding(false)}
        />
      )}

      {kitItems.length === 0 && !adding && (
        <div className="rounded-3xl bg-white p-10 text-center shadow-soft">
          <p className="font-bold text-plum-900">No items yet</p>
          <p className="mt-1 text-sm text-plum-800/60">Add pads, wipes, sanitizer, chocolate — whatever customers can build a kit from.</p>
        </div>
      )}

      <div className="space-y-3">
        {kitItems.map((item) => (
          <div key={item.id} className="rounded-3xl bg-white p-4 shadow-soft">
            {editingId === item.id ? (
              <KitItemForm
                initial={item}
                categories={categories}
                onSave={(patch) => {
                  updateKitItem(item.id, patch)
                  setEditingId(null)
                }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="flex flex-wrap items-center gap-4">
                <div
                  className="h-16 w-16 shrink-0 rounded-2xl bg-blush-100 bg-cover bg-center"
                  style={item.photo ? { backgroundImage: `url(${item.photo})` } : undefined}
                />
                <div className="min-w-[180px] flex-1">
                  <p className="font-display text-plum-900">{item.name}</p>
                  <p className="text-xs text-plum-800/50">{item.category} · up to {item.maxQty} per kit</p>
                </div>
                <p className="font-bold text-plum-900">{formatINR(item.price)}</p>
                <button
                  onClick={() => setEditingId(item.id)}
                  className="cursor-pointer rounded-full bg-blush-100 px-4 py-2 text-sm font-bold text-blush-700 transition-colors hover:bg-blush-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteKitItem(item.id)}
                  aria-label={`Delete ${item.name}`}
                  className="grid h-9 w-9 cursor-pointer place-items-center rounded-full text-plum-800/50 transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
