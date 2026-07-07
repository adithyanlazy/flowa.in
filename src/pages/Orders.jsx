import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, PackageSearch } from 'lucide-react'
import PageWrap from '../components/PageWrap.jsx'
import { useAdmin } from '../context/AdminContext.jsx'
import { useRequireAuth } from '../hooks/useRequireAuth.js'
import { fetchOrdersForUser } from '../lib/orders.js'
import { formatINR } from '../data/products.js'
import { STATUS_BADGE_CLASSES, STATUS_LABELS } from '../lib/orderStatus.js'

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-IN', { dateStyle: 'medium' })
  } catch {
    return iso
  }
}

export default function Orders() {
  const { userId } = useAdmin()
  const { isLoggedIn, authLoading } = useRequireAuth('/orders')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoggedIn || !userId) return
    let cancelled = false
    fetchOrdersForUser(userId).then((data) => {
      if (!cancelled) {
        setOrders(data)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [isLoggedIn, userId])

  if (authLoading || !isLoggedIn) {
    return (
      <PageWrap className="mx-auto max-w-xl px-4 py-24 text-center">
        <Loader2 size={28} className="mx-auto animate-spin text-blush-500" />
      </PageWrap>
    )
  }

  return (
    <PageWrap className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
      <h1 className="font-display text-4xl text-plum-900">Your orders</h1>
      <p className="mt-2 text-plum-800/60">Track every Flowa box you've ordered.</p>

      {loading ? (
        <div className="mt-10 text-center">
          <Loader2 size={24} className="mx-auto animate-spin text-blush-500" />
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-10 rounded-3xl bg-white p-10 text-center shadow-soft">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-blush-100">
            <PackageSearch size={24} className="text-blush-500" />
          </span>
          <p className="mt-4 font-bold text-plum-900">No orders yet</p>
          <p className="mt-1 text-sm text-plum-800/60">Orders you place at checkout will show up here.</p>
          <Link
            to="/shop"
            className="mt-6 inline-block rounded-full bg-plum-900 px-8 py-3.5 text-sm font-bold text-white transition-colors hover:bg-blush-600"
          >
            Go to shop
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                to={`/orders/${order.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-white p-5 shadow-soft transition-colors hover:bg-blush-50 sm:p-6"
              >
                <div>
                  <p className="font-display text-lg text-plum-900">#{order.id}</p>
                  <p className="text-xs text-plum-800/50">
                    {formatDate(order.placedAt)} · {order.items?.length || 0} item{order.items?.length === 1 ? '' : 's'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3.5 py-1.5 text-xs font-bold ${STATUS_BADGE_CLASSES[order.status] || STATUS_BADGE_CLASSES.pending}`}>
                    {STATUS_LABELS[order.status] || STATUS_LABELS.pending}
                  </span>
                  <p className="font-display text-lg text-plum-900">{formatINR(order.total)}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageWrap>
  )
}
