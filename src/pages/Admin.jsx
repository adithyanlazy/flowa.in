import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Database, FileQuestion, Lock, LogOut, MessageSquareQuote, Package, Palette, Settings } from 'lucide-react'
import PageWrap from '../components/PageWrap.jsx'
import { useAdmin } from '../context/AdminContext.jsx'
import ProductsTab from '../components/admin/ProductsTab.jsx'
import ReviewsTab from '../components/admin/ReviewsTab.jsx'
import FaqsTab from '../components/admin/FaqsTab.jsx'
import ContentTab from '../components/admin/ContentTab.jsx'
import ThemeTab from '../components/admin/ThemeTab.jsx'
import DataTab from '../components/admin/DataTab.jsx'

const tabs = [
  { id: 'products', label: 'Products', icon: Package },
  { id: 'reviews', label: 'Reviews', icon: MessageSquareQuote },
  { id: 'faqs', label: 'FAQs', icon: FileQuestion },
  { id: 'content', label: 'Site Content', icon: Settings },
  { id: 'theme', label: 'Theme', icon: Palette },
  { id: 'data', label: 'Data', icon: Database },
]

function LoginGate() {
  const { login } = useAdmin()
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (!login(pass)) {
      setError('Wrong passcode')
      setPass('')
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col items-center justify-center px-4 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-blush-100">
        <Lock size={28} className="text-blush-500" />
      </span>
      <h1 className="mt-6 font-display text-2xl text-plum-900">Admin access</h1>
      <p className="mt-2 text-sm text-plum-800/60">Enter the passcode to customize the site.</p>
      <form onSubmit={submit} className="mt-6 w-full space-y-3">
        <input
          type="password"
          value={pass}
          autoFocus
          onChange={(e) => {
            setPass(e.target.value)
            setError('')
          }}
          placeholder="Passcode"
          className={`w-full rounded-2xl border-2 bg-white px-4 py-3.5 text-center text-plum-900 outline-none transition-colors focus:border-blush-400 ${error ? 'border-red-400' : 'border-blush-100'}`}
        />
        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full cursor-pointer rounded-full bg-plum-900 py-3.5 text-sm font-bold text-white transition-colors hover:bg-blush-600"
        >
          Unlock
        </button>
      </form>
      <Link to="/" className="mt-6 text-sm font-bold text-plum-800/60 hover:text-blush-600">
        Back to site
      </Link>
    </div>
  )
}

function AdminPanel() {
  const { logout } = useAdmin()
  const [tab, setTab] = useState('products')
  const Active = { products: ProductsTab, reviews: ReviewsTab, faqs: FaqsTab, content: ContentTab, theme: ThemeTab, data: DataTab }[tab]

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
  const { authed } = useAdmin()
  return <PageWrap>{authed ? <AdminPanel /> : <LoginGate />}</PageWrap>
}
