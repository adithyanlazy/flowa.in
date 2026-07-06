import { useEffect, useState } from 'react'
import { PackageSearch } from 'lucide-react'
import { fetchOrders, subscribeOrders } from '../../lib/orders.js'
import { formatINR } from '../../data/products.js'

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return iso
  }
}

export default function OrdersTab() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchOrders().then((data) => {
      if (!cancelled) {
        setOrders(data)
        setLoading(false)
      }
    })
    const unsubscribe = subscribeOrders((order) => {
      setOrders((prev) => (prev.some((o) => o.id === order.id) ? prev : [order, ...prev]))
    })
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  if (loading) {
    return <p className="text-sm text-plum-800/60">Loading orders…</p>
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center shadow-soft">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-blush-100">
          <PackageSearch size={24} className="text-blush-500" />
        </span>
        <p className="mt-4 font-bold text-plum-900">No orders yet</p>
        <p className="mt-1 text-sm text-plum-800/60">Orders placed at checkout will show up here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div key={order.id} className="rounded-3xl bg-white p-5 shadow-soft">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-blush-100 pb-3">
            <div>
              <p className="font-display text-lg text-plum-900">#{order.id}</p>
              <p className="text-xs text-plum-800/50">
                {formatDate(order.placedAt)} · {order.payment}
              </p>
            </div>
            <p className="font-display text-xl text-plum-900">{formatINR(order.total)}</p>
          </div>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-plum-800/50">Customer</p>
              <p className="mt-1 text-sm font-bold text-plum-900">{order.customer?.name}</p>
              <p className="text-sm text-plum-800/70">{order.customer?.phone}</p>
              <p className="text-sm text-plum-800/70">
                {order.customer?.address}, {order.customer?.city} - {order.customer?.pincode}
              </p>
              {order.customer?.note && (
                <p className="mt-1 text-sm italic text-plum-800/60">Note: {order.customer.note}</p>
              )}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-plum-800/50">Items</p>
              <ul className="mt-1 space-y-1 text-sm text-plum-800/70">
                {order.items?.map((item) => (
                  <li key={item.id} className="flex justify-between gap-3">
                    <span>
                      {item.name} × {item.qty}
                    </span>
                    <span>{formatINR(item.price * item.qty)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
