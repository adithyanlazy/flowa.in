import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, Loader2, MessageCircle, Package, Truck } from 'lucide-react'
import PageWrap from '../components/PageWrap.jsx'
import { useStore } from '../context/StoreContext.jsx'
import { useAdmin } from '../context/AdminContext.jsx'
import { formatINR } from '../data/products.js'
import { fetchOrderById } from '../lib/orders.js'

const confettiColors = ['#ec4899', '#8b5cf6', '#f9a8d4', '#fbbf24', '#34d399']

function Confetti() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-72 overflow-hidden">
      {Array.from({ length: 24 }).map((_, i) => (
        <motion.span
          key={i}
          initial={{ y: -30, x: 0, opacity: 1, rotate: 0 }}
          animate={{ y: 300, x: (i % 2 ? 1 : -1) * (20 + (i * 7) % 60), opacity: 0, rotate: 260 }}
          transition={{ duration: 2.4 + (i % 5) * 0.3, delay: (i % 8) * 0.12, ease: 'easeIn' }}
          className="absolute h-2.5 w-2.5 rounded-sm"
          style={{ left: `${(i * 4.1) % 100}%`, background: confettiColors[i % confettiColors.length] }}
        />
      ))}
    </div>
  )
}

export default function OrderSuccess() {
  const { id } = useParams()
  const { lastOrder } = useStore()
  const { content } = useAdmin()
  const navigate = useNavigate()
  // lastOrder covers the instant post-checkout render (no flash of a
  // loading state); a page refresh loses that session-only context, so fall
  // back to fetching the order by id from Supabase (RLS: owner or admin).
  const [fetched, setFetched] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const order = lastOrder?.id === id ? lastOrder : fetched

  useEffect(() => {
    if (lastOrder?.id === id) return
    let cancelled = false
    fetchOrderById(id).then((result) => {
      if (cancelled) return
      if (result) setFetched(result)
      else setNotFound(true)
    })
    return () => {
      cancelled = true
    }
  }, [id, lastOrder])

  useEffect(() => {
    if (notFound) navigate('/', { replace: true })
  }, [notFound, navigate])

  if (!order) {
    return (
      <PageWrap className="mx-auto max-w-xl px-4 py-24 text-center">
        <Loader2 size={28} className="mx-auto animate-spin text-blush-500" />
      </PageWrap>
    )
  }

  return (
    <PageWrap className="relative mx-auto max-w-2xl px-6 py-16 text-center">
      <Confetti />
      <motion.div
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 14, stiffness: 200 }}
        className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-emerald-100"
      >
        <CheckCircle2 size={48} className="text-emerald-600" />
      </motion.div>

      <h1 className="mt-8 font-display text-4xl text-plum-900">Order placed with love 🎀</h1>
      <p className="mx-auto mt-3 max-w-md text-plum-800/70">
        Thank you, {order.customer.name.split(' ')[0]}! Your care package is being packed and will reach{' '}
        {order.customer.city} soon.
      </p>

      <div className="mt-10 rounded-3xl bg-white p-8 text-left shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blush-100 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-plum-800/50">Order ID</p>
            <p className="font-display text-lg text-plum-900">{order.id}</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-bold text-emerald-700">
            {order.payment}
          </span>
        </div>
        <ul className="mt-4 space-y-2 text-sm">
          {order.items.map((i) => (
            <li key={i.id}>
              <div className="flex justify-between text-plum-800/80">
                <span>{i.name} × {i.qty}</span>
                <span className="font-bold text-plum-900">{formatINR(i.price * i.qty)}</span>
              </div>
              {i.contents?.length > 0 && (
                <p className="mt-0.5 text-xs text-plum-800/50">{i.contents.join(', ')}</p>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-blush-100 pt-4">
          <span className="font-bold text-plum-900">To pay on delivery</span>
          <span className="font-display text-xl text-plum-900">{formatINR(order.total)}</span>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-2xl bg-blush-50 p-4 text-sm">
            <Package size={20} className="shrink-0 text-blush-500" />
            <span className="text-plum-800/80">Packed discreetly within 24 hours</span>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-blush-50 p-4 text-sm">
            <Truck size={20} className="shrink-0 text-blush-500" />
            <span className="text-plum-800/80">Delivery in 2–7 days, free of charge</span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          to="/shop"
          className="rounded-full bg-plum-900 px-8 py-4 text-sm font-bold text-white transition-colors hover:bg-blush-600"
        >
          Continue shopping
        </Link>
        <Link
          to={`/orders/${order.id}`}
          className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold text-plum-900 shadow-soft transition-colors hover:bg-blush-100"
        >
          <Package size={16} /> View order status
        </Link>
        <a
          href={`https://wa.me/${content.whatsappNumber}?text=Hi!%20Tracking%20my%20order%20${order.id}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold text-plum-900 shadow-soft transition-colors hover:bg-blush-100"
        >
          <MessageCircle size={16} /> Track on WhatsApp
        </a>
      </div>
    </PageWrap>
  )
}
