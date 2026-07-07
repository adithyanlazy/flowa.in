import { supabase, supabaseEnabled } from './supabase.js'

const LS_KEY = 'flowa-orders'

function loadLocalOrders() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

// Records a placed order for the admin Orders tab (and the owning customer's
// /orders page) to read. Supabase is the source of truth once configured
// (cross-device); without it, falls back to a local list so orders still
// show up in the admin panel on the same device. Checkout requires login,
// so userId is always set when Supabase is enabled — RLS's "user insert own
// orders" policy checks auth.uid() = user_id.
export async function recordOrder(order, userId) {
  if (!supabaseEnabled) {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify([order, ...loadLocalOrders()]))
    } catch {
      // storage unavailable
    }
    return
  }
  const { error } = await supabase.from('orders').insert({ id: order.id, data: order, user_id: userId })
  if (error) console.error('Flowa: failed to save order to Supabase', error)
}

// Merges the real `status`/`tracking_number`/`tracking_url` columns onto the
// JSONB `data` blob so callers get one flat order object either way.
function rowToOrder(row) {
  return { ...row.data, status: row.status, tracking_number: row.tracking_number, tracking_url: row.tracking_url }
}

// Admin-only: RLS only lets an admin caller's delete match a row (see "admin
// delete" policy in scripts/supabase-schema.sql) — a non-admin's call matches
// zero rows and comes back as error: null, so the caller can't tell success
// from a silently-blocked no-op without this returning nothing to act on.
export async function deleteOrder(id) {
  if (!supabaseEnabled) {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(loadLocalOrders().filter((o) => o.id !== id)))
    } catch {
      // storage unavailable
    }
    return { error: null }
  }
  const { error } = await supabase.from('orders').delete().eq('id', id)
  if (error) console.error('Flowa: failed to delete order', error)
  return { error: error?.message || null }
}

export async function fetchOrders() {
  if (!supabaseEnabled) return loadLocalOrders()
  const { data, error } = await supabase
    .from('orders')
    .select('data, status, tracking_number, tracking_url')
    .order('created_at', { ascending: false })
  if (error) {
    console.error('Flowa: failed to fetch orders', error)
    return []
  }
  return data.map(rowToOrder)
}

// Customer's own order history for the /orders page. RLS's "users read own
// orders" policy already scopes this to the caller, but filtering here too
// keeps the query cheap and the intent explicit.
export async function fetchOrdersForUser(userId) {
  if (!supabaseEnabled) return loadLocalOrders().filter((o) => o.customer)
  const { data, error } = await supabase
    .from('orders')
    .select('data, status, tracking_number, tracking_url')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) {
    console.error('Flowa: failed to fetch orders for user', error)
    return []
  }
  return data.map(rowToOrder)
}

// Single order for /orders/:id and the post-checkout success page. RLS (own
// order or admin) gates access — a mismatched id or someone else's order
// simply comes back as no row, not an error.
export async function fetchOrderById(id) {
  if (!supabaseEnabled) return loadLocalOrders().find((o) => o.id === id) || null
  const { data, error } = await supabase
    .from('orders')
    .select('data, status, tracking_number, tracking_url')
    .eq('id', id)
    .maybeSingle()
  if (error) {
    console.error('Flowa: failed to fetch order', error)
    return null
  }
  return data ? rowToOrder(data) : null
}

// Admin-only: RLS's "admin update orders" policy matches zero rows for a
// non-admin caller, same silent-no-op shape as deleteOrder above.
export async function updateOrderStatus(id, patch) {
  if (!supabaseEnabled) return { error: null }
  const { error } = await supabase.from('orders').update(patch).eq('id', id)
  if (error) console.error('Flowa: failed to update order', error)
  return { error: error?.message || null }
}

// Subscribes to new + deleted orders so an open Orders tab updates live
// (e.g. a delete from another admin's tab). Returns an unsubscribe function;
// no-op when Supabase isn't configured. Callback receives the raw
// postgres_changes payload — INSERT carries the full row in payload.new,
// DELETE only carries the primary key in payload.old (id is that PK, so it's
// always present even without REPLICA IDENTITY FULL).
export function subscribeOrders(onChange) {
  if (!supabaseEnabled) return () => {}
  const channel = supabase
    .channel('orders_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, onChange)
    .subscribe()
  return () => supabase.removeChannel(channel)
}
