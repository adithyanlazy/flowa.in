import { useState } from 'react'
import { Plus, RotateCcw, Trash2 } from 'lucide-react'
import { useAdmin } from '../../context/AdminContext.jsx'
import { formatINR } from '../../data/products.js'
import ProductForm from './ProductForm.jsx'

export default function ProductsTab() {
  const { products, baseProducts, hiddenIds, updateProduct, addProduct, deleteProduct, restoreProduct } = useAdmin()
  const [editingId, setEditingId] = useState(null)
  const [adding, setAdding] = useState(false)

  const hiddenBase = baseProducts.filter((p) => hiddenIds.includes(p.id))

  return (
    <div className="space-y-4">
      {!adding && (
        <button
          onClick={() => setAdding(true)}
          className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-plum-900 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blush-600"
        >
          <Plus size={15} /> Add product
        </button>
      )}

      {adding && (
        <ProductForm
          onSave={(patch) => {
            addProduct(patch)
            setAdding(false)
          }}
          onCancel={() => setAdding(false)}
        />
      )}

      <div className="space-y-3">
        {products.map((p) => (
          <div key={p.id} className="rounded-3xl bg-white p-4 shadow-soft">
            {editingId === p.id ? (
              <ProductForm
                initial={p}
                onSave={(patch) => {
                  updateProduct(p.id, patch)
                  setEditingId(null)
                }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="flex flex-wrap items-center gap-4">
                <div
                  className="h-16 w-16 shrink-0 rounded-2xl bg-cover bg-center"
                  style={{ backgroundImage: p.photo ? `url(${p.photo})` : undefined, background: p.photo ? undefined : `linear-gradient(140deg, ${p.palette[0]}, ${p.palette[2]})` }}
                />
                <div className="min-w-[180px] flex-1">
                  <p className="font-display text-plum-900">{p.name}</p>
                  <p className="text-xs text-plum-800/50">{p.category} · {p.stock} {p.badge ? `· ${p.badge}` : ''}</p>
                </div>
                <p className="font-bold text-plum-900">{formatINR(p.price)}</p>
                <button
                  onClick={() => setEditingId(p.id)}
                  className="cursor-pointer rounded-full bg-blush-100 px-4 py-2 text-sm font-bold text-blush-700 transition-colors hover:bg-blush-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteProduct(p.id)}
                  aria-label={`Delete ${p.name}`}
                  className="grid h-9 w-9 cursor-pointer place-items-center rounded-full text-plum-800/50 transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {hiddenBase.length > 0 && (
        <div className="pt-4">
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-plum-800/50">Hidden products</p>
          <div className="space-y-2">
            {hiddenBase.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-2xl bg-blush-50 px-4 py-3">
                <span className="text-sm font-semibold text-plum-800/70">{p.name}</span>
                <button
                  onClick={() => restoreProduct(p.id)}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-plum-800 shadow-soft transition-colors hover:bg-blush-100"
                >
                  <RotateCcw size={12} /> Restore
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
