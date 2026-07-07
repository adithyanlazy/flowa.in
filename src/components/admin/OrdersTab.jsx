import { useEffect, useState } from 'react'
import { PackageSearch, Trash2 } from 'lucide-react'
import { deleteOrder, fetchOrders, subscribeOrders, updateOrderStatus } from '../../lib/orders.js'
import { formatINR } from '../../data/products.js'
import { ALL_STATUSES, STATUS_BADGE_CLASSES, STATUS_LABELS } from '../../lib/orderStatus.js'

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
  const [trackingDrafts, setTrackingDrafts] = useState({})

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
      const row = payload.new
      const order = row?.data
      if (!order) return
      const merged = { ...order, status: row.status, tracking_number: row.tracking_number, tracking_url: row.tracking_url }
      setOrders((prev) =>
        prev.some((o) => o.id === merged.id) ? prev.map((o) => (o.id === merged.id ? merged : o)) : [merged, ...prev],
      )
    })
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  const handleStatusChange = async (id, status) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)))
    const { error } = await updateOrderStatus(id, { status })
    if (error) setActionError(error)
  }

  const setDraft = (order, patch) =>
    setTrackingDrafts((d) => ({
      ...d,
      [order.id]: { number: order.tracking_number || '', url: order.tracking_url || '', ...d[order.id], ...patch },
    }))

  const handleSaveTracking = async (id) => {
    const draft = trackingDrafts[id]
    if (!draft) return
    setBusyId(id)
    const { error } = await updateOrderStatus(id, { tracking_number: draft.number || null, tracking_url: draft.url || null })
    if (error) {
      setActionError(error)
    } else {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, tracking_number: draft.number, tracking_url: draft.url } : o)))
      setTrackingDrafts((d) => {
        const next = { ...d }
        delete next[id]
        return next
      })
    }
    setBusyId(null)
  }

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
              <select
                value={order.status || 'pending'}
                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                className={`cursor-pointer rounded-full border-0 px-3.5 py-1.5 text-xs font-bold outline-none ${
                  STATUS_BADGE_CLASSES[order.status] || STATUS_BADGE_CLASSES.pending
                }`}
              >
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
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
                  <li key={item.id}>
                    <div className="flex justify-between gap-3">
                      <span>
                        {item.name} × {item.qty}
                      </span>
                      <span>{formatINR(item.price * item.qty)}</span>
                    </div>
                    {item.contents?.length > 0 && (
                      <p className="mt-0.5 text-xs italic text-plum-800/50">Contains: {item.contents.join(', ')}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-blush-100 pt-4">
            <div className="flex-1 min-w-[160px]">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-plum-800/50">Tracking number</label>
              <input
                type="text"
                value={(trackingDrafts[order.id] ?? { number: order.tracking_number || '' }).number}
                onChange={(e) => setDraft(order, { number: e.target.value })}
                className="w-full rounded-xl border-2 border-blush-100 bg-cream px-3 py-2 text-sm text-plum-900 outline-none focus:border-blush-400"
              />
            </div>
            <div className="flex-1 min-w-[160px]">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-plum-800/50">Tracking URL</label>
              <input
                type="text"
                value={(trackingDrafts[order.id] ?? { url: order.tracking_url || '' }).url}
                onChange={(e) => setDraft(order, { url: e.target.value })}
                className="w-full rounded-xl border-2 border-blush-100 bg-cream px-3 py-2 text-sm text-plum-900 outline-none focus:border-blush-400"
              />
            </div>
            <button
              onClick={() => handleSaveTracking(order.id)}
              disabled={busyId === order.id || !trackingDrafts[order.id]}
              className="cursor-pointer rounded-full bg-plum-900 px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-blush-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Save
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
