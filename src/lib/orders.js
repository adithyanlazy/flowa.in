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

export async function fetchOrders() {
  if (!supabaseEnabled) return loadLocalOrders()
  const { data, error } = await supabase.from('orders').select('data').order('created_at', { ascending: false })
  if (error) {
    console.error('Flowa: failed to fetch orders', error)
    return []
  }
  return data.map((row) => row.data)
}

// Subscribes to newly-inserted orders so an open Orders tab updates live.
// Returns an unsubscribe function; no-op when Supabase isn't configured.
export function subscribeOrders(onInsert) {
  if (!supabaseEnabled) return () => {}
  const channel = supabase
    .channel('orders_changes')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
      if (payload.new?.data) onInsert(payload.new.data)
    })
    .subscribe()
  return () => supabase.removeChannel(channel)
}
