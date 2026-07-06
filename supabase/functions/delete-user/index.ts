// Deletes a Supabase Auth user (and, via the profiles.id FK's `on delete
// cascade`, their profile row) permanently. Runs server-side because
// `auth.admin.deleteUser` needs the service_role key, which must never ship
// to the browser bundle. Callers must be signed in AND already flagged
// is_admin in profiles — verified here with the service_role client so RLS
// on `profiles` can't be bypassed by a forged request.
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const json = (body, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  try {
    const authHeader = req.headers.get('Authorization') || ''
    const token = authHeader.replace('Bearer ', '')
    if (!token) return json({ error: 'Missing auth token' }, 401)

    const { userId } = await req.json()
    if (!userId || typeof userId !== 'string') return json({ error: 'Missing userId' }, 400)

    const admin = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))

    const { data: callerData, error: callerErr } = await admin.auth.getUser(token)
    if (callerErr || !callerData?.user) return json({ error: 'Invalid session' }, 401)
    const callerId = callerData.user.id

    const { data: callerProfile, error: callerProfileErr } = await admin
      .from('profiles')
      .select('is_admin')
      .eq('id', callerId)
      .maybeSingle()
    if (callerProfileErr || !callerProfile?.is_admin) return json({ error: 'Admins only' }, 403)

    if (userId === callerId) return json({ error: "You can't delete your own account" }, 400)

    const { data: targetProfile } = await admin.from('profiles').select('is_admin').eq('id', userId).maybeSingle()
    if (targetProfile?.is_admin) {
      const { count } = await admin.from('profiles').select('id', { count: 'exact', head: true }).eq('is_admin', true)
      if ((count || 0) <= 1) return json({ error: 'Cannot delete the last remaining admin' }, 400)
    }

    const { error: deleteErr } = await admin.auth.admin.deleteUser(userId)
    if (deleteErr) return json({ error: deleteErr.message }, 400)

    return json({ success: true })
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Unknown error' }, 500)
  }
})
