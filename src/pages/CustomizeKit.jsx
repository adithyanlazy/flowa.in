import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Minus, Package, Plus, RotateCcw, Sparkles } from 'lucide-react'
import PageWrap from '../components/PageWrap.jsx'
import { useAdmin } from '../context/AdminContext.jsx'
import { useStore } from '../context/StoreContext.jsx'
import { formatINR } from '../data/products.js'

function ItemCard({ item, qty, onChange }) {
  return (
    <div className={`flex items-center gap-4 rounded-2xl bg-white p-4 shadow-soft transition-colors ${qty > 0 ? 'ring-2 ring-blush-400' : ''}`}>
      <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-blush-50 bg-cover bg-center" style={item.photo ? { backgroundImage: `url(${item.photo})` } : undefined}>
        {!item.photo && <Package size={22} className="text-blush-400" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold text-plum-900">{item.name}</p>
        <p className="text-sm text-plum-800/60">{formatINR(item.price)} each</p>
      </div>
      <div className="flex shrink-0 items-center gap-2 rounded-full bg-blush-50 px-1 py-1">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, qty - 1))}
          disabled={qty <= 0}
          aria-label={`Remove one ${item.name}`}
          className="grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-white text-plum-800 shadow-sm transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Minus size={14} />
        </button>
        <span className="w-6 text-center text-sm font-bold text-plum-900">{qty}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(item.maxQty, qty + 1))}
          disabled={qty >= item.maxQty}
          aria-label={`Add one ${item.name}`}
          className="grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-white text-plum-800 shadow-sm transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  )
}

export default function CustomizeKit() {
  const { kitItems } = useAdmin()
  const { addCustomKit } = useStore()
  const navigate = useNavigate()
  const [selections, setSelections] = useState({})
  const [kitName, setKitName] = useState('')

  const grouped = useMemo(() => {
    const byCat = {}
    kitItems.forEach((item) => {
      const cat = item.category || 'Essentials'
      byCat[cat] = byCat[cat] || []
      byCat[cat].push(item)
    })
    return Object.entries(byCat)
  }, [kitItems])

  const chosen = kitItems.filter((item) => (selections[item.id] || 0) > 0)
  const itemCount = chosen.reduce((s, item) => s + selections[item.id], 0)
  const subtotal = chosen.reduce((s, item) => s + item.price * selections[item.id], 0)

  const setQty = (id, qty) => setSelections((s) => (qty <= 0 ? Object.fromEntries(Object.entries(s).filter(([k]) => k !== id)) : { ...s, [id]: qty }))
  const reset = () => {
    setSelections({})
    setKitName('')
  }

  const addKitToBag = () => {
    if (chosen.length === 0) return
    const kit = {
      id: `custom-kit-${Date.now()}`,
      name: kitName.trim() || 'My Custom Kit',
      tagline: 'Built by you, just the way you like it',
      description: 'A kit you built yourself — every item picked to fit exactly what you need.',
      price: subtotal,
      mrp: subtotal,
      rating: 0,
      reviewCount: 0,
      stock: 'in',
      badge: 'Custom',
      palette: ['#fef3c7', '#fde68a', '#f59e0b'],
      art: 'spark',
      photo: null,
      contents: chosen.map((item) => `${item.name} × ${selections[item.id]}`),
      benefits: [],
    }
    addCustomKit(kit)
    reset()
    navigate('/checkout')
  }

  if (kitItems.length === 0) {
    return (
      <PageWrap className="mx-auto max-w-xl px-4 py-24 text-center">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-blush-100">
          <Sparkles size={32} className="text-blush-500" />
        </span>
        <h1 className="mt-6 font-display text-2xl text-plum-900">Customize Your Day is almost here</h1>
        <p className="mt-2 text-plum-800/60">We're stocking up the build-your-own-kit shelf. Check back soon.</p>
      </PageWrap>
    )
  }

  return (
    <PageWrap className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <p className="text-sm font-bold uppercase tracking-widest text-blush-500">Customize your day</p>
      <h1 className="mt-2 font-display text-4xl text-plum-900">Build a kit that's exactly you</h1>
      <p className="mt-3 max-w-lg text-plum-800/70">
        Pick what you need, skip what you don't, and set your own quantities. We'll pack it just for you.
      </p>

      <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-[1.6fr_1fr] lg:gap-10">
        <div className="space-y-8">
          {grouped.map(([category, items]) => (
            <section key={category}>
              <h2 className="mb-3 font-display text-lg text-plum-900">{category}</h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <ItemCard key={item.id} item={item} qty={selections[item.id] || 0} onChange={(qty) => setQty(item.id, qty)} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="rounded-3xl bg-white p-6 shadow-soft lg:sticky lg:top-28 lg:p-8">
          <h2 className="font-display text-xl text-plum-900">Your kit</h2>

          <div className="mt-4">
            <label htmlFor="kitName" className="mb-1 block text-xs font-bold uppercase tracking-wide text-plum-800/60">
              Name your kit (optional)
            </label>
            <input
              id="kitName"
              value={kitName}
              onChange={(e) => setKitName(e.target.value)}
              placeholder="My Custom Kit"
              className="w-full rounded-xl border-2 border-blush-100 bg-cream px-3.5 py-2.5 text-sm text-plum-900 outline-none transition-colors focus:border-blush-400"
            />
          </div>

          {chosen.length === 0 ? (
            <p className="mt-6 text-sm text-plum-800/50">Add items from the list to start building your kit.</p>
          ) : (
            <motion.ul layout className="mt-5 space-y-2 text-sm">
              {chosen.map((item) => (
                <motion.li layout key={item.id} className="flex justify-between text-plum-800/80">
                  <span>{item.name} × {selections[item.id]}</span>
                  <span className="font-bold text-plum-900">{formatINR(item.price * selections[item.id])}</span>
                </motion.li>
              ))}
            </motion.ul>
          )}

          <div className="mt-6 space-y-2 border-t border-blush-100 pt-4 text-sm">
            <div className="flex justify-between text-plum-800/70">
              <span>Items</span>
              <span>{itemCount}</span>
            </div>
            <div className="flex justify-between border-t border-blush-100 pt-3">
              <span className="font-bold text-plum-900">Kit total</span>
              <span className="font-display text-2xl text-plum-900">{formatINR(subtotal)}</span>
            </div>
          </div>

          <button
            onClick={addKitToBag}
            disabled={chosen.length === 0}
            className="mt-6 w-full cursor-pointer rounded-full bg-plum-900 py-4 text-sm font-bold text-white transition-colors duration-200 hover:bg-blush-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Add my kit to bag
          </button>
          {chosen.length > 0 && (
            <button
              onClick={reset}
              className="mt-3 inline-flex w-full cursor-pointer items-center justify-center gap-1.5 text-sm font-bold text-plum-800/60 hover:text-blush-600"
            >
              <RotateCcw size={13} /> Start over
            </button>
          )}
        </aside>
      </div>
    </PageWrap>
  )
}
