import { supabase, supabaseEnabled } from './supabase.js'

// Admin-only: RLS only returns rows to callers who are themselves admins
// (see "admins read all profiles" in scripts/supabase-schema.sql), so a
// non-admin calling this just gets an empty list back, not an error.
export async function fetchProfiles() {
  if (!supabaseEnabled) return []
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, is_admin, created_at')
    .order('created_at', { ascending: true })
  if (error) {
    console.error('Flowa: failed to fetch profiles', error)
    return []
  }
  return data
}

// Returns the updated row so the caller can trust what actually changed —
// without `.select()`, RLS silently filtering the update to zero rows (e.g.
// blocked by the last-admin guard, or a stale/revoked caller) would still
// come back as `error: null`, indistinguishable from a real success.
// `.single()` turns that silent no-op into a real, catchable error instead.
export async function setUserAdmin(id, isAdmin) {
  if (!supabaseEnabled) return { error: 'Supabase not configured' }
  const { data, error } = await supabase.from('profiles').update({ is_admin: isAdmin }).eq('id', id).select().single()
  if (error) console.error('Flowa: failed to update profile admin flag', error)
  return { error: error?.message || null, profile: data }
}

// Subscribes to new signups and admin-flag changes so an open Users tab
// updates live. Returns an unsubscribe function; no-op when Supabase isn't configured.
export function subscribeProfiles(onChange) {
  if (!supabaseEnabled) return () => {}
  const channel = supabase
    .channel('profiles_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
      if (payload.new) onChange(payload.new)
    })
    .subscribe()
  return () => supabase.removeChannel(channel)
}
