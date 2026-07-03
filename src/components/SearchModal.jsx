import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Search, TrendingUp, X } from 'lucide-react'
import ProductVisual from './ProductVisual.jsx'
import { useStore } from '../context/StoreContext.jsx'
import { useAdmin } from '../context/AdminContext.jsx'
import { formatINR, trendingSearches } from '../data/products.js'

export default function SearchModal() {
  const { searchOpen, setSearchOpen } = useStore()
  const { products } = useAdmin()
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (searchOpen) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 80)
    }
  }, [searchOpen])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setSearchOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setSearchOpen])

  const q = query.trim().toLowerCase()
  const results = q
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.contents.some((c) => c.toLowerCase().includes(q)),
      )
    : []

  const go = (id) => {
    setSearchOpen(false)
    navigate(`/product/${id}`)
  }

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center bg-plum-900/50 p-4 pt-[12vh] backdrop-blur-sm"
          onClick={() => setSearchOpen(false)}
        >
          <motion.div
            initial={{ y: -24, scale: 0.97, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: -16, scale: 0.97, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl overflow-hidden rounded-3xl bg-cream shadow-lift"
            role="dialog"
            aria-label="Search products"
          >
            <div className="flex items-center gap-3 border-b border-blush-100 px-5 py-4">
              <Search size={20} className="shrink-0 text-blush-500" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search kits, pads, relief patches…"
                aria-label="Search products"
                className="w-full bg-transparent text-base text-plum-900 outline-none placeholder:text-plum-800/40"
              />
              <button
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
                className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full text-plum-800 hover:bg-blush-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[52vh] overflow-y-auto p-4">
              {!q && (
                <div>
                  <p className="mb-3 flex items-center gap-2 px-2 text-xs font-bold uppercase tracking-wider text-plum-800/50">
                    <TrendingUp size={14} /> Trending
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {trendingSearches.map((t) => (
                      <button
                        key={t}
                        onClick={() => setQuery(t)}
                        className="cursor-pointer rounded-full bg-white px-4 py-2 text-sm font-semibold text-plum-800 shadow-soft transition-colors hover:bg-blush-100"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {q && results.length === 0 && (
                <p className="px-2 py-8 text-center text-sm text-plum-800/60">
                  Nothing found for “{query}”. Try “pads” or “relief”.
                </p>
              )}

              <ul className="space-y-2">
                {results.map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => go(p.id)}
                      className="flex w-full cursor-pointer items-center gap-4 rounded-2xl p-2 text-left transition-colors hover:bg-white"
                    >
                      <ProductVisual product={p} className="h-14 w-14 shrink-0 rounded-xl" />
                      <span className="flex-1">
                        <span className="block font-display text-sm text-plum-900">{p.name}</span>
                        <span className="block text-xs text-plum-800/60">{p.category}</span>
                      </span>
                      <span className="font-display text-plum-900">{formatINR(p.price)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
