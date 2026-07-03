import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SlidersHorizontal } from 'lucide-react'
import PageWrap from '../components/PageWrap.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { useAdmin } from '../context/AdminContext.jsx'

const baseCategories = ['Kits', 'Combos', 'Essentials', 'Gifting']
const sorts = [
  { id: 'featured', label: 'Featured' },
  { id: 'price-asc', label: 'Price: low to high' },
  { id: 'price-desc', label: 'Price: high to low' },
  { id: 'rating', label: 'Top rated' },
]

export default function Shop() {
  const { products } = useAdmin()
  const [params, setParams] = useSearchParams()
  const cat = params.get('cat') || 'All'
  const [sort, setSort] = useState('featured')

  const categories = useMemo(() => {
    const extra = [...new Set(products.map((p) => p.category))].filter((c) => !baseCategories.includes(c))
    return ['All', ...baseCategories, ...extra]
  }, [products])

  const list = useMemo(() => {
    let l = cat === 'All' ? [...products] : products.filter((p) => p.category === cat)
    if (sort === 'price-asc') l.sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') l.sort((a, b) => b.price - a.price)
    if (sort === 'rating') l.sort((a, b) => b.rating - a.rating)
    return l
  }, [products, cat, sort])

  return (
    <PageWrap className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-10">
        <p className="text-sm font-bold uppercase tracking-widest text-blush-500">The Flowa shop</p>
        <h1 className="mt-2 font-display text-4xl text-plum-900">Care for every kind of day</h1>
        <p className="mt-3 max-w-lg text-plum-800/70">
          Every product ships free in a discreet box, with pay-on-delivery across India.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by category">
          {categories.map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={cat === c}
              onClick={() => setParams(c === 'All' ? {} : { cat: c })}
              className={`cursor-pointer rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-200 ${
                cat === c ? 'bg-plum-900 text-white shadow-soft' : 'bg-white text-plum-800 shadow-soft hover:bg-blush-100'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-soft">
          <SlidersHorizontal size={15} className="text-blush-500" />
          <span className="sr-only">Sort products</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="cursor-pointer bg-transparent text-sm font-bold text-plum-900 outline-none"
          >
            {sorts.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <motion.div layout className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        {list.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </motion.div>

      {list.length === 0 && (
        <p className="py-20 text-center text-plum-800/60">No products in this category yet.</p>
      )}
    </PageWrap>
  )
}
