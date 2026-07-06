import { useEffect, useState } from 'react'
import { ShieldCheck, ShieldOff, Users as UsersIcon } from 'lucide-react'
import { fetchProfiles, setUserAdmin, subscribeProfiles } from '../../lib/profiles.js'
import { useAdmin } from '../../context/AdminContext.jsx'

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

  useEffect(() => {
    let cancelled = false
    fetchProfiles().then((data) => {
      if (!cancelled) {
        setProfiles(data)
        setLoading(false)
      }
    })
    const unsubscribe = subscribeProfiles((row) => {
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
        return (
          <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-white p-4 shadow-soft">
            <div>
              <p className="font-bold text-plum-900">
                {p.full_name || p.email} {isSelf && <span className="font-normal text-plum-800/40">(you)</span>}
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
              <button
                onClick={() => toggleAdmin(p)}
                disabled={isSelf || busyId === p.id}
                title={isSelf ? "You can't change your own access" : undefined}
                className="cursor-pointer rounded-full bg-plum-900 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blush-600 disabled:cursor-not-allowed disabled:bg-plum-900/20"
              >
                {p.is_admin ? 'Remove admin' : 'Make admin'}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
