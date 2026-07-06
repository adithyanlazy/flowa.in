import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ClipboardList,
  Database,
  Eye,
  EyeOff,
  FileQuestion,
  Loader2,
  Lock,
  LogOut,
  Mail,
  MessageSquareQuote,
  Package,
  Palette,
  Settings,
  User,
  Users,
} from 'lucide-react'
import PageWrap from '../components/PageWrap.jsx'
import { useAdmin } from '../context/AdminContext.jsx'
import LogoMark from '../components/LogoMark.jsx'
import OrdersTab from '../components/admin/OrdersTab.jsx'
import UsersTab from '../components/admin/UsersTab.jsx'
import ProductsTab from '../components/admin/ProductsTab.jsx'
import ReviewsTab from '../components/admin/ReviewsTab.jsx'
import FaqsTab from '../components/admin/FaqsTab.jsx'
import ContentTab from '../components/admin/ContentTab.jsx'
import ThemeTab from '../components/admin/ThemeTab.jsx'
import DataTab from '../components/admin/DataTab.jsx'

const tabs = [
  { id: 'orders', label: 'Orders', icon: ClipboardList },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'reviews', label: 'Reviews', icon: MessageSquareQuote },
  { id: 'faqs', label: 'FAQs', icon: FileQuestion },
  { id: 'content', label: 'Site Content', icon: Settings },
  { id: 'theme', label: 'Theme', icon: Palette },
  { id: 'data', label: 'Data', icon: Database },
]

function AuthGate() {
  const { signIn, signUp } = useAdmin()
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState(searchParams.get('mode') === 'signup' ? 'signup' : 'signin') // 'signin' | 'signup'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')
    if (mode === 'signin') {
      setBusy(true)
      const err = await signIn(email, password)
      if (err) setError(err)
      setBusy(false)
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setBusy(true)
    const { error: err, needsConfirmation } = await signUp(email, password, name)
    if (err) setError(err)
    else if (needsConfirmation) setNotice('Account created — check your email to confirm, then sign in.')
    else setNotice('Account created. Ask an existing admin to grant this account access from the Users tab.')
    setBusy(false)
  }

  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <LogoMark className="h-11 w-11" />
          </Link>
          <h1 className="mt-6 font-display text-3xl text-plum-900">{mode === 'signin' ? 'Welcome back' : 'Create an account'}</h1>
          <p className="mt-2 text-plum-800/60">
            {mode === 'signin' ? 'Sign in to the Flowa admin.' : 'New accounts need to be granted access by an existing admin.'}
          </p>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-soft">
          <form onSubmit={submit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="mb-1.5 block text-sm font-bold text-plum-900">Full name</label>
                <div className="relative">
                  <User size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-plum-800/30" />
                  <input
                    type="text"
                    value={name}
                    autoFocus
                    autoComplete="name"
                    required
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full rounded-2xl border-2 border-blush-100 bg-cream py-3.5 pl-11 pr-4 text-plum-900 outline-none transition-colors placeholder:text-plum-800/30 focus:border-blush-400"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-bold text-plum-900">Email</label>
              <div className="relative">
                <Mail size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-plum-800/30" />
                <input
                  type="email"
                  value={email}
                  autoFocus={mode === 'signin'}
                  autoComplete="email"
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border-2 border-blush-100 bg-cream py-3.5 pl-11 pr-4 text-plum-900 outline-none transition-colors placeholder:text-plum-800/30 focus:border-blush-400"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-bold text-plum-900">Password</label>
              <div className="relative">
                <Lock size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-plum-800/30" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full rounded-2xl border-2 bg-cream py-3.5 pl-11 pr-11 text-plum-900 outline-none transition-colors placeholder:text-plum-800/30 focus:border-blush-400 ${
                    error ? 'border-red-400' : 'border-blush-100'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-plum-800/30 hover:text-plum-800/60"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="mb-1.5 block text-sm font-bold text-plum-900">Confirm password</label>
                <div className="relative">
                  <Lock size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-plum-800/30" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    autoComplete="new-password"
                    required
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full rounded-2xl border-2 bg-cream py-3.5 pl-11 pr-4 text-plum-900 outline-none transition-colors placeholder:text-plum-800/30 focus:border-blush-400 ${
                      error ? 'border-red-400' : 'border-blush-100'
                    }`}
                  />
                </div>
              </div>
            )}

            {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
            {notice && <p className="text-sm font-semibold text-emerald-600">{notice}</p>}

            <button
              type="submit"
              disabled={busy}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-plum-900 py-3.5 text-sm font-bold text-white transition-colors hover:bg-blush-600 disabled:cursor-wait disabled:opacity-70"
            >
              {busy && <Loader2 size={16} className="animate-spin" />}
              {busy ? (mode === 'signin' ? 'Signing in…' : 'Creating account…') : mode === 'signin' ? 'Sign in' : 'Sign up'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-plum-800/60">
            {mode === 'signin' ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    setMode('signup')
                    setError('')
                    setNotice('')
                  }}
                  className="cursor-pointer font-bold text-blush-600 hover:text-blush-700"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setMode('signin')
                    setError('')
                    setNotice('')
                  }}
                  className="cursor-pointer font-bold text-blush-600 hover:text-blush-700"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm font-bold text-plum-800/60 hover:text-blush-600">
            Back to site
          </Link>
        </div>
      </div>
    </div>
  )
}

function PendingApproval() {
  const { userEmail, logout } = useAdmin()
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col items-center justify-center px-4 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-blush-100">
        <Lock size={28} className="text-blush-500" />
      </span>
      <h1 className="mt-6 font-display text-2xl text-plum-900">Access pending</h1>
      <p className="mt-2 text-sm text-plum-800/60">
        Signed in as <span className="font-bold text-plum-900">{userEmail}</span>, but this account hasn't been granted admin access yet.
      </p>
      <button
        onClick={logout}
        className="mt-6 cursor-pointer rounded-full bg-white px-6 py-3 text-sm font-bold text-plum-800 shadow-soft transition-colors hover:bg-blush-100"
      >
        Log out
      </button>
    </div>
  )
}

function AdminPanel() {
  const { logout } = useAdmin()
  const [tab, setTab] = useState('products')
  const Active = {
    orders: OrdersTab,
    products: ProductsTab,
    users: UsersTab,
    reviews: ReviewsTab,
    faqs: FaqsTab,
    content: ContentTab,
    theme: ThemeTab,
    data: DataTab,
  }[tab]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-blush-500">Flowa admin</p>
          <h1 className="mt-1 font-display text-3xl text-plum-900">Customize your site</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/" className="text-sm font-bold text-plum-800/60 hover:text-blush-600">
            View site
          </Link>
          <button
            onClick={logout}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-bold text-plum-800 shadow-soft transition-colors hover:bg-blush-100"
          >
            <LogOut size={14} /> Log out
          </button>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-200 ${
              tab === t.id ? 'bg-plum-900 text-white shadow-soft' : 'bg-white text-plum-800 shadow-soft hover:bg-blush-100'
            }`}
          >
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <Active />
      </motion.div>
    </div>
  )
}

export default function Admin() {
  const { authed, authLoading, pendingApproval } = useAdmin()

  if (authLoading) {
    return (
      <PageWrap className="grid min-h-[70vh] place-items-center">
        <Loader2 size={28} className="animate-spin text-blush-400" />
      </PageWrap>
    )
  }

  return <PageWrap>{authed ? <AdminPanel /> : pendingApproval ? <PendingApproval /> : <AuthGate />}</PageWrap>
}
