import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ClipboardList,
  Database,
  FileQuestion,
  Loader2,
  Lock,
  LogOut,
  MessageSquareQuote,
  Package,
  Palette,
  Settings,
  Users,
} from 'lucide-react'
import PageWrap from '../components/PageWrap.jsx'
import { useAdmin } from '../context/AdminContext.jsx'
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

function Unauthorized() {
  const { userEmail, logout } = useAdmin()
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col items-center justify-center px-4 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-blush-100">
        <Lock size={28} className="text-blush-500" />
      </span>
      <h1 className="mt-6 font-display text-2xl text-plum-900">Admins only</h1>
      <p className="mt-2 text-sm text-plum-800/60">
        Signed in as <span className="font-bold text-plum-900">{userEmail}</span>, but this account doesn't have admin access. Ask an
        existing admin to grant it from the Users tab.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          to="/"
          className="cursor-pointer rounded-full bg-white px-6 py-3 text-sm font-bold text-plum-800 shadow-soft transition-colors hover:bg-blush-100"
        >
          Back to site
        </Link>
        <button
          onClick={logout}
          className="cursor-pointer rounded-full bg-white px-6 py-3 text-sm font-bold text-plum-800 shadow-soft transition-colors hover:bg-blush-100"
        >
          Log out
        </button>
      </div>
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
  const { authed, authLoading, isLoggedIn, pendingApproval } = useAdmin()

  if (authLoading) {
    return (
      <PageWrap className="grid min-h-[70vh] place-items-center">
        <Loader2 size={28} className="animate-spin text-blush-400" />
      </PageWrap>
    )
  }

  if (!isLoggedIn) return <Navigate to="/login?redirect=/admin" replace />

  return <PageWrap>{authed ? <AdminPanel /> : pendingApproval && <Unauthorized />}</PageWrap>
}
