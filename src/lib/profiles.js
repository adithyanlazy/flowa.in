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

// Permanently deletes an account via the `delete-user` edge function — the
// service_role key needed for auth.admin.deleteUser can't live in the browser
// bundle, so this hits a server-side function instead of Supabase directly.
export async function deleteUser(id) {
  if (!supabaseEnabled) return { error: 'Supabase not configured' }
  const { data, error } = await supabase.functions.invoke('delete-user', { body: { userId: id } })
  if (error) return { error: error.message }
  if (data?.error) return { error: data.error }
  return { error: null }
}

// Subscribes to new signups, admin-flag changes, and deletions so an open
// Users tab updates live. Returns an unsubscribe function; no-op when
// Supabase isn't configured. Callback receives the raw postgres_changes
// payload so the caller can tell inserts/updates (payload.new) apart from
// deletes (payload.eventType === 'DELETE', only payload.old is populated).
export function subscribeProfiles(onChange) {
  if (!supabaseEnabled) return () => {}
  const channel = supabase
    .channel('profiles_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, onChange)
    .subscribe()
  return () => supabase.removeChannel(channel)
}
