import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Heart, ShoppingBag } from 'lucide-react'
import ProductVisual from './ProductVisual.jsx'
import Stars from './Stars.jsx'
import { useStore } from '../context/StoreContext.jsx'
import { formatINR } from '../data/products.js'

export default function ProductCard({ product, index = 0 }) {
  const { addToCart, wishlist, toggleWishlist, showToast } = useStore()
  const wished = wishlist.includes(product.id)
  const off = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0
  const buyable = product.stock === 'in'

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: (index % 4) * 0.06, ease: 'easeOut' }}
      className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-soft transition-shadow duration-300 hover:shadow-lift"
    >
      <Link to={`/product/${product.id}`} className="relative block" aria-label={product.name}>
        <ProductVisual product={product} className="aspect-[4/3] w-full transition-transform duration-500 group-hover:scale-[1.03]" />
        {product.badge && (
          <span className="absolute left-4 top-4 rounded-full bg-white/85 px-3 py-1 text-xs font-bold text-plum-800 backdrop-blur">
            {product.badge}
          </span>
        )}
        {product.stock === 'out' && (
          <span className="absolute inset-0 grid place-items-center bg-white/60 backdrop-blur-[2px]">
            <span className="rounded-full bg-plum-900 px-4 py-1.5 text-xs font-bold text-white">Out of stock</span>
          </span>
        )}
      </Link>

      <button
        onClick={() => toggleWishlist(product.id)}
        aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
        className="absolute right-4 top-4 grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-white/85 backdrop-blur transition-transform duration-200 hover:scale-110 active:scale-95"
      >
        <Heart size={18} className={wished ? 'fill-blush-500 text-blush-500' : 'text-plum-800'} />
      </button>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-blush-500">{product.category}</span>
          <Stars rating={product.rating} />
        </div>
        <Link to={`/product/${product.id}`} className="font-display text-lg leading-snug text-plum-900 hover:text-blush-600">
          {product.name}
        </Link>
        <p className="line-clamp-2 text-sm text-plum-800/70">{product.tagline}</p>

        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-xl text-plum-900">{formatINR(product.price)}</span>
              {off > 0 && <span className="text-sm text-plum-800/50 line-through">{formatINR(product.mrp)}</span>}
            </div>
            <span className="text-xs font-bold text-emerald-600">{off > 0 ? `${off}% off · ` : ''}free delivery</span>
          </div>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              if (product.stock === 'out') return showToast('This kit is out of stock — join the waitlist on the product page')
              addToCart(product.id)
            }}
            aria-label={`Add ${product.name} to cart`}
            className={`grid h-11 w-11 cursor-pointer place-items-center rounded-2xl transition-colors duration-200 ${
              buyable
                ? 'bg-plum-900 text-white hover:bg-blush-600'
                : 'bg-blush-100 text-plum-800 hover:bg-blush-200'
            }`}
          >
            <ShoppingBag size={18} />
          </motion.button>
        </div>
      </div>
    </motion.article>
  )
}
