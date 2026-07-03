import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BadgeCheck,
  Bell,
  Check,
  ChevronRight,
  Heart,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from 'lucide-react'
import PageWrap from '../components/PageWrap.jsx'
import ProductCard from '../components/ProductCard.jsx'
import ProductVisual from '../components/ProductVisual.jsx'
import Stars from '../components/Stars.jsx'
import Avatar from '../components/Avatar.jsx'
import { useStore } from '../context/StoreContext.jsx'
import { useAdmin } from '../context/AdminContext.jsx'
import { formatINR } from '../data/products.js'

export default function ProductDetail() {
  const { id } = useParams()
  const { products, reviews, getProduct, content } = useAdmin()
  const product = getProduct(id)
  const { addToCart, wishlist, toggleWishlist, showToast } = useStore()
  const [qty, setQty] = useState(1)

  if (!product) {
    return (
      <PageWrap className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl text-plum-900">Product not found</h1>
        <Link to="/shop" className="mt-4 inline-block font-bold text-blush-600 hover:underline">
          Back to shop
        </Link>
      </PageWrap>
    )
  }

  const wished = wishlist.includes(product.id)
  const off = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0
  const related = products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4)
  const fallbackRelated = related.length ? related : products.filter((p) => p.id !== product.id).slice(0, 4)
  const productReviews = reviews.filter((r) => product.name.toLowerCase().includes(r.product.toLowerCase().split(' ')[0]))

  return (
    <PageWrap className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-1.5 text-sm text-plum-800/60">
        <Link to="/" className="hover:text-blush-600">Home</Link>
        <ChevronRight size={14} />
        <Link to="/shop" className="hover:text-blush-600">Shop</Link>
        <ChevronRight size={14} />
        <span className="font-bold text-plum-900">{product.name}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-2">
        {/* visual */}
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45 }}>
          <div className="relative">
            <ProductVisual product={product} className="aspect-square w-full rounded-[2.5rem] shadow-soft" />
            {product.badge && (
              <span className="absolute left-6 top-6 rounded-full bg-white/90 px-4 py-1.5 text-sm font-bold text-plum-800 backdrop-blur">
                {product.badge}
              </span>
            )}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[Truck, Package, ShieldCheck].map((Icon, i) => (
              <div key={i} className="flex items-center gap-2 rounded-2xl bg-white px-3 py-3 text-xs font-bold text-plum-800 shadow-soft">
                <Icon size={16} className="shrink-0 text-blush-500" />
                {['Free delivery', 'Discreet box', 'Dermat tested'][i]}
              </div>
            ))}
          </div>
        </motion.div>

        {/* info */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.08 }}>
          <p className="text-sm font-bold uppercase tracking-widest text-blush-500">{product.category}</p>
          <h1 className="mt-2 font-display text-3xl text-plum-900 sm:text-4xl">{product.name}</h1>
          <p className="mt-2 text-lg text-plum-800/70">{product.tagline}</p>

          <div className="mt-4 flex items-center gap-3">
            <Stars rating={product.rating} showValue />
            <span className="text-sm text-plum-800/60">{product.reviewCount} reviews</span>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-display text-4xl text-plum-900">{formatINR(product.price)}</span>
            {off > 0 && <span className="text-lg text-plum-800/50 line-through">{formatINR(product.mrp)}</span>}
            {off > 0 && <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">{off}% off</span>}
          </div>
          <p className="mt-1 text-sm text-plum-800/60">Inclusive of all taxes · Free delivery · Pay on delivery</p>

          <p className="mt-6 leading-relaxed text-plum-800/80">{product.description}</p>

          {/* benefits */}
          <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {product.benefits.map((b) => (
              <li key={b} className="flex items-center gap-2 text-sm font-semibold text-plum-900">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blush-100 text-blush-600">
                  <Check size={13} />
                </span>
                {b}
              </li>
            ))}
          </ul>

          {/* actions */}
          {product.stock === 'in' && (
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3 rounded-full bg-white px-2 py-2 shadow-soft">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-blush-50 text-plum-900 transition-colors hover:bg-blush-100"
                >
                  <Minus size={16} />
                </button>
                <span className="w-6 text-center font-display text-lg text-plum-900">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(10, q + 1))}
                  aria-label="Increase quantity"
                  className="grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-blush-50 text-plum-900 transition-colors hover:bg-blush-100"
                >
                  <Plus size={16} />
                </button>
              </div>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => addToCart(product.id, qty)}
                className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-plum-900 px-8 py-4 text-sm font-bold text-white shadow-lift transition-colors duration-200 hover:bg-blush-600 sm:flex-none"
              >
                <ShoppingBag size={17} /> Add to bag · {formatINR(product.price * qty)}
              </motion.button>
              <button
                onClick={() => toggleWishlist(product.id)}
                aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
                className="grid h-13 w-13 cursor-pointer place-items-center rounded-full bg-white p-4 shadow-soft transition-transform hover:scale-105"
              >
                <Heart size={20} className={wished ? 'fill-blush-500 text-blush-500' : 'text-plum-800'} />
              </button>
            </div>
          )}

          {product.stock === 'preorder' && (
            <div className="mt-8 space-y-3">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => addToCart(product.id, qty)}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-lav-500 px-8 py-4 text-sm font-bold text-white shadow-lift transition-colors duration-200 hover:bg-lav-600 sm:w-auto"
              >
                <Bell size={17} /> Pre-order now · ships next week
              </motion.button>
              <p className="text-sm text-plum-800/60">Pre-orders are charged on delivery, like every Flowa order.</p>
            </div>
          )}

          {product.stock === 'out' && (
            <div className="mt-8 rounded-2xl bg-blush-50 p-5">
              <p className="font-bold text-plum-900">Currently out of stock</p>
              <p className="mt-1 text-sm text-plum-800/70">Leave your number on WhatsApp and we'll ping you the moment it's back.</p>
              <a
                href={`https://wa.me/${content.whatsappNumber}?text=Notify%20me%20when%20back%20in%20stock`}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-plum-900 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-blush-600"
              >
                <Bell size={15} /> Notify me
              </a>
            </div>
          )}

          {/* contents */}
          <div className="mt-10 rounded-3xl bg-white p-6 shadow-soft">
            <h2 className="font-display text-lg text-plum-900">What's inside</h2>
            <ul className="mt-4 space-y-3">
              {product.contents.map((c) => (
                <li key={c} className="flex items-center gap-3 text-plum-800/80">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blush-50 text-blush-500">
                    <Package size={15} />
                  </span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>

      {/* reviews */}
      {productReviews.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-8 font-display text-2xl text-plum-900">What women say about this</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {productReviews.map((r) => (
              <figure key={r.name} className="rounded-3xl bg-white p-6 shadow-soft">
                <Stars rating={r.rating} />
                <blockquote className="mt-3 leading-relaxed text-plum-800/80">“{r.text}”</blockquote>
                <figcaption className="mt-4 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2.5 font-bold text-plum-900">
                    <Avatar name={r.name} size={32} />
                    {r.name} · {r.location}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                    <BadgeCheck size={13} /> Verified
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* related */}
      <section className="mt-20">
        <h2 className="mb-8 font-display text-2xl text-plum-900">You might also love</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {fallbackRelated.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>
    </PageWrap>
  )
}
