import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Check, ExternalLink, Loader2, XCircle } from 'lucide-react'
import PageWrap from '../components/PageWrap.jsx'
import { useRequireAuth } from '../hooks/useRequireAuth.js'
import { fetchOrderById } from '../lib/orders.js'
import { formatINR } from '../data/products.js'
import { CANCELLED_STATUS, ORDER_STATUSES, STATUS_LABELS } from '../lib/orderStatus.js'

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return iso
  }
}

function StatusTimeline({ status }) {
  if (status === CANCELLED_STATUS) {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-600">
        <XCircle size={20} /> This order was cancelled
      </div>
    )
  }

  const currentIndex = Math.max(ORDER_STATUSES.indexOf(status), 0)

  return (
    <ol className="flex items-start justify-between gap-1">
      {ORDER_STATUSES.map((step, i) => {
        const done = i <= currentIndex
        return (
          <li key={step} className="flex flex-1 flex-col items-center text-center">
            <div className="flex w-full items-center">
              <span className={`h-0.5 flex-1 ${i === 0 ? 'invisible' : done ? 'bg-emerald-500' : 'bg-blush-100'}`} />
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${
                  done ? 'bg-emerald-500 text-white' : 'bg-blush-100 text-plum-800/40'
                }`}
              >
                {done ? <Check size={15} /> : i + 1}
              </span>
              <span className={`h-0.5 flex-1 ${i === ORDER_STATUSES.length - 1 ? 'invisible' : i < currentIndex ? 'bg-emerald-500' : 'bg-blush-100'}`} />
            </div>
            <span className={`mt-2 text-xs font-bold ${done ? 'text-plum-900' : 'text-plum-800/40'}`}>{STATUS_LABELS[step]}</span>
          </li>
        )
      })}
    </ol>
  )
}

export default function OrderDetail() {
  const { id } = useParams()
  const { isLoggedIn, authLoading } = useRequireAuth(`/orders/${id}`)
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!isLoggedIn) return
    let cancelled = false
    fetchOrderById(id).then((result) => {
      if (cancelled) return
      if (result) setOrder(result)
      else setNotFound(true)
    })
    return () => {
      cancelled = true
    }
  }, [id, isLoggedIn])

  useEffect(() => {
    if (notFound) navigate('/orders', { replace: true })
  }, [notFound, navigate])

  if (authLoading || !isLoggedIn || !order) {
    return (
      <PageWrap className="mx-auto max-w-xl px-4 py-24 text-center">
        <Loader2 size={28} className="mx-auto animate-spin text-blush-500" />
      </PageWrap>
    )
  }

  return (
    <PageWrap className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-12">
      <Link to="/orders" className="text-sm font-bold text-plum-800/60 hover:text-blush-600">
        ← Back to your orders
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="font-display text-3xl text-plum-900">Order #{order.id}</h1>
          <p className="mt-1 text-sm text-plum-800/60">Placed {formatDate(order.placedAt)}</p>
        </div>
      </div>

      <section className="mt-8 rounded-3xl bg-white p-6 shadow-soft sm:p-8">
        <StatusTimeline status={order.status} />
        {(order.tracking_number || order.tracking_url) && (
          <div className="mt-6 rounded-2xl bg-blush-50 p-4 text-sm">
            {order.tracking_number && (
              <p className="text-plum-800/80">
                Tracking number: <span className="font-bold text-plum-900">{order.tracking_number}</span>
              </p>
            )}
            {order.tracking_url && (
              <a
                href={order.tracking_url}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-1 font-bold text-blush-600 hover:text-blush-700"
              >
                Track shipment <ExternalLink size={13} />
              </a>
            )}
          </div>
        )}
      </section>

      <section className="mt-6 rounded-3xl bg-white p-6 shadow-soft sm:p-8">
        <h2 className="font-display text-xl text-plum-900">Shipping details</h2>
        <div className="mt-4 space-y-1 text-sm text-plum-800/80">
          <p className="font-bold text-plum-900">{order.customer?.name}</p>
          <p>{order.customer?.phone}</p>
          <p>
            {order.customer?.address}, {order.customer?.city} - {order.customer?.pincode}
          </p>
          {order.customer?.note && <p className="italic text-plum-800/60">Note: {order.customer.note}</p>}
        </div>
      </section>

      <section className="mt-6 rounded-3xl bg-white p-6 shadow-soft sm:p-8">
        <h2 className="font-display text-xl text-plum-900">Items</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {order.items?.map((item) => (
            <li key={item.id}>
              <div className="flex justify-between text-plum-800/80">
                <span>{item.name} × {item.qty}</span>
                <span className="font-bold text-plum-900">{formatINR(item.price * item.qty)}</span>
              </div>
              {item.contents?.length > 0 && (
                <p className="mt-0.5 text-xs text-plum-800/50">{item.contents.join(', ')}</p>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-blush-100 pt-4">
          <span className="font-bold text-plum-900">{order.payment}</span>
          <span className="font-display text-xl text-plum-900">{formatINR(order.total)}</span>
        </div>
      </section>
    </PageWrap>
  )
}
