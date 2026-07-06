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

// Records a placed order for the admin Orders tab to read. Supabase is the
// source of truth once configured (cross-device); without it, falls back to
// a local list so orders still show up in the admin panel on the same device.
export async function recordOrder(order) {
  if (!supabaseEnabled) {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify([order, ...loadLocalOrders()]))
    } catch {
      // storage unavailable
    }
    return
  }
  const { error } = await supabase.from('orders').insert({ id: order.id, data: order })
  if (error) console.error('Flowa: failed to save order to Supabase', error)
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
  const { data, error } = await supabase.from('orders').select('data').order('created_at', { ascending: false })
  if (error) {
    console.error('Flowa: failed to fetch orders', error)
    return []
  }
  return data.map((row) => row.data)
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
