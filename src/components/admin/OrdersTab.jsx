import { useEffect, useState } from 'react'
import { PackageSearch, Trash2 } from 'lucide-react'
import { deleteOrder, fetchOrders, subscribeOrders } from '../../lib/orders.js'
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
  const [busyId, setBusyId] = useState(null)
  const [actionError, setActionError] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetchOrders().then((data) => {
      if (!cancelled) {
        setOrders(data)
        setLoading(false)
      }
    })
    const unsubscribe = subscribeOrders((payload) => {
      if (payload.eventType === 'DELETE') {
        setOrders((prev) => prev.filter((o) => o.id !== payload.old?.id))
        return
      }
      const order = payload.new?.data
      if (!order) return
      setOrders((prev) => (prev.some((o) => o.id === order.id) ? prev : [order, ...prev]))
    })
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  const handleDelete = async (id) => {
    setBusyId(id)
    setActionError('')
    const { error } = await deleteOrder(id)
    if (error) {
      setActionError(error)
    } else {
      setOrders((prev) => prev.filter((o) => o.id !== id))
    }
    setConfirmDeleteId(null)
    setBusyId(null)
  }

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
      {actionError && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{actionError}</p>}
      {orders.map((order) => (
        <div key={order.id} className="rounded-3xl bg-white p-5 shadow-soft">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-blush-100 pb-3">
            <div>
              <p className="font-display text-lg text-plum-900">#{order.id}</p>
              <p className="text-xs text-plum-800/50">
                {formatDate(order.placedAt)} · {order.payment}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <p className="font-display text-xl text-plum-900">{formatINR(order.total)}</p>
              {confirmDeleteId === order.id ? (
                <>
                  <span className="text-sm font-bold text-red-600">Delete?</span>
                  <button
                    onClick={() => handleDelete(order.id)}
                    disabled={busyId === order.id}
                    className="cursor-pointer rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-wait disabled:opacity-70"
                  >
                    Yes, delete
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    disabled={busyId === order.id}
                    className="cursor-pointer rounded-full bg-white px-4 py-2 text-sm font-bold text-plum-800 shadow-soft transition-colors hover:bg-blush-100"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setConfirmDeleteId(order.id)}
                  disabled={busyId === order.id}
                  aria-label={`Delete order ${order.id}`}
                  title="Delete order"
                  className="grid h-9 w-9 cursor-pointer place-items-center rounded-full text-plum-800/50 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
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
