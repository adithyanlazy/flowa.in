import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Loader2, Lock, Mail, User } from 'lucide-react'
import PageWrap from '../components/PageWrap.jsx'
import { useAdmin } from '../context/AdminContext.jsx'
import LogoMark from '../components/LogoMark.jsx'

export default function Login() {
  const { signIn, signUp, isLoggedIn } = useAdmin()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'
  const [mode, setMode] = useState(searchParams.get('mode') === 'signup' ? 'signup' : 'signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (isLoggedIn) navigate(redirectTo, { replace: true })
  }, [isLoggedIn, navigate, redirectTo])

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
    setBusy(false)
  }

  return (
    <PageWrap className="flex min-h-[75vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <LogoMark className="h-11 w-11" />
          </Link>
          <h1 className="mt-6 font-display text-3xl text-plum-900">{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h1>
          <p className="mt-2 text-plum-800/60">
            {mode === 'signin' ? 'Sign in to your Flowa account.' : 'Join Flowa for faster checkout and order history.'}
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
    </PageWrap>
  )
}
