import { useEffect, useState } from 'react'
import { ShieldCheck, ShieldOff, Trash2, Users as UsersIcon } from 'lucide-react'
import { deleteUser, fetchProfiles, setUserAdmin, subscribeProfiles } from '../../lib/profiles.js'
import { useAdmin } from '../../context/AdminContext.jsx'

// Kept in sync with the email hardcoded in prevent_protected_admin_change()
// (scripts/supabase-schema.sql) — that trigger is the real enforcement, this
// is just so the UI shows the account as locked instead of letting any admin
// click the button and get a raw DB error back.
const PROTECTED_EMAIL = 'adithyadev2004.2@gmail.com'

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return iso
  }
}

export default function UsersTab() {
  const { userId } = useAdmin()
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [actionError, setActionError] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetchProfiles().then((data) => {
      if (!cancelled) {
        setProfiles(data)
        setLoading(false)
      }
    })
    const unsubscribe = subscribeProfiles((payload) => {
      if (payload.eventType === 'DELETE') {
        setProfiles((prev) => prev.filter((p) => p.id !== payload.old?.id))
        return
      }
      const row = payload.new
      if (!row) return
      setProfiles((prev) => {
        const exists = prev.some((p) => p.id === row.id)
        return exists ? prev.map((p) => (p.id === row.id ? row : p)) : [...prev, row]
      })
    })
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  const toggleAdmin = async (profile) => {
    setBusyId(profile.id)
    setActionError('')
    const { error, profile: updated } = await setUserAdmin(profile.id, !profile.is_admin)
    if (error) {
      setActionError(error)
    } else if (updated) {
      setProfiles((prev) => prev.map((p) => (p.id === profile.id ? updated : p)))
    }
    setBusyId(null)
  }

  const handleDelete = async (profile) => {
    setBusyId(profile.id)
    setActionError('')
    const { error } = await deleteUser(profile.id)
    if (error) {
      setActionError(error)
    } else {
      setProfiles((prev) => prev.filter((p) => p.id !== profile.id))
    }
    setConfirmDeleteId(null)
    setBusyId(null)
  }

  if (loading) {
    return <p className="text-sm text-plum-800/60">Loading users…</p>
  }

  if (profiles.length === 0) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center shadow-soft">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-blush-100">
          <UsersIcon size={24} className="text-blush-500" />
        </span>
        <p className="mt-4 font-bold text-plum-900">No accounts yet</p>
        <p className="mt-1 text-sm text-plum-800/60">People who sign up at /login will show up here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-plum-800/60">
        Anyone can sign up at <span className="font-bold text-plum-900">/login</span>, but they get no admin access until you make them
        admin here.
      </p>
      {actionError && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{actionError}</p>}
      {profiles.map((p) => {
        const isSelf = p.id === userId
        const isProtected = p.email === PROTECTED_EMAIL
        return (
          <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-white p-4 shadow-soft">
            <div>
              <p className="font-bold text-plum-900">
                {p.full_name || p.email} {isSelf && <span className="font-normal text-plum-800/40">(you)</span>}
                {isProtected && <span className="ml-1.5 font-normal text-plum-800/40">(protected)</span>}
              </p>
              {p.full_name && <p className="text-xs text-plum-800/50">{p.email}</p>}
              <p className="text-xs text-plum-800/50">Joined {formatDate(p.created_at)}</p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
                  p.is_admin ? 'bg-emerald-50 text-emerald-700' : 'bg-blush-50 text-plum-800/60'
                }`}
              >
                {p.is_admin ? <ShieldCheck size={13} /> : <ShieldOff size={13} />}
                {p.is_admin ? 'Admin' : 'Member'}
              </span>
              {confirmDeleteId === p.id ? (
                <>
                  <span className="text-sm font-bold text-red-600">Delete permanently?</span>
                  <button
                    onClick={() => handleDelete(p)}
                    disabled={busyId === p.id}
                    className="cursor-pointer rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-wait disabled:opacity-70"
                  >
                    Yes, delete
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    disabled={busyId === p.id}
                    className="cursor-pointer rounded-full bg-white px-4 py-2 text-sm font-bold text-plum-800 shadow-soft transition-colors hover:bg-blush-100"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => toggleAdmin(p)}
                    disabled={isSelf || isProtected || busyId === p.id}
                    title={isSelf ? "You can't change your own access" : isProtected ? 'This account is permanently admin' : undefined}
                    className="cursor-pointer rounded-full bg-plum-900 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blush-600 disabled:cursor-not-allowed disabled:bg-plum-900/20"
                  >
                    {p.is_admin ? 'Remove admin' : 'Make admin'}
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(p.id)}
                    disabled={isSelf || isProtected || busyId === p.id}
                    title={isSelf ? "You can't delete your own account" : isProtected ? 'This account is protected' : 'Delete account'}
                    aria-label={`Delete ${p.email}`}
                    className="grid h-9 w-9 cursor-pointer place-items-center rounded-full text-plum-800/50 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Trash2 size={15} />
                  </button>
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
