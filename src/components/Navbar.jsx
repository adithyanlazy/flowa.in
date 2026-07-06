import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Heart, LogOut, Menu, Search, ShoppingBag, X } from 'lucide-react'
import { useStore } from '../context/StoreContext.jsx'
import { useAdmin } from '../context/AdminContext.jsx'
import LogoMark from './LogoMark.jsx'

const links = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/about', label: 'Our Story' },
  { to: '/contact', label: 'Contact' },
]

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2" aria-label="Flowa home">
      <LogoMark className="h-9 w-9" />
      <span className="font-display text-2xl tracking-tight text-plum-900">
        flowa<span className="text-blush-500">.</span>
      </span>
    </Link>
  )
}

export default function Navbar() {
  const { cartCount, wishlist, setCartOpen, setSearchOpen } = useStore()
  const { content, authed, userEmail, logout } = useAdmin()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* announcement bar */}
      <div className="bg-plum-900 py-2 text-center text-xs font-semibold tracking-wide text-blush-100">
        {content.announcement}
      </div>

      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled ? 'bg-cream/85 shadow-soft backdrop-blur-xl' : 'bg-cream/60 backdrop-blur-sm'
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Logo />

          <ul className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2 text-sm font-bold transition-colors duration-200 ${
                      isActive ? 'bg-blush-100 text-blush-700' : 'text-plum-800 hover:bg-blush-50 hover:text-blush-600'
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search products"
              className="grid h-11 w-11 cursor-pointer place-items-center rounded-full text-plum-800 transition-colors hover:bg-blush-100"
            >
              <Search size={20} />
            </button>
            <Link
              to="/wishlist"
              aria-label={`Wishlist, ${wishlist.length} items`}
              className="relative grid h-11 w-11 place-items-center rounded-full text-plum-800 transition-colors hover:bg-blush-100"
            >
              <Heart size={20} />
              {wishlist.length > 0 && (
                <span className="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-lav-500 text-[10px] font-bold text-white">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <button
              onClick={() => setCartOpen(true)}
              aria-label={`Open cart, ${cartCount} items`}
              className="relative grid h-11 w-11 cursor-pointer place-items-center rounded-full text-plum-800 transition-colors hover:bg-blush-100"
            >
              <ShoppingBag size={20} />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0.4 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute right-0.5 top-0.5 grid h-5 w-5 place-items-center rounded-full bg-blush-500 text-[10px] font-bold text-white"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              className="grid h-11 w-11 cursor-pointer place-items-center rounded-full text-plum-800 transition-colors hover:bg-blush-100 md:hidden"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          <div className="hidden items-center gap-2.5 md:flex">
            {authed ? (
              <>
                <span className="flex items-center gap-2 text-sm font-bold text-plum-800">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-plum-900 text-xs text-white">
                    {userEmail?.[0]?.toUpperCase()}
                  </span>
                  {userEmail}
                </span>
                <button
                  onClick={logout}
                  className="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-2 text-sm font-bold text-plum-800/60 transition-colors hover:bg-blush-50 hover:text-blush-600"
                >
                  <LogOut size={15} /> Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/admin"
                  className="rounded-full px-4 py-2 text-sm font-bold text-plum-800 transition-colors hover:bg-blush-50 hover:text-blush-600"
                >
                  Login
                </Link>
                <Link
                  to="/admin?mode=signup"
                  className="rounded-full bg-plum-900 px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-blush-600"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </nav>

        <AnimatePresence>
          {mobileOpen && (
            <motion.ul
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="overflow-hidden border-t border-blush-100 bg-cream px-4 md:hidden"
            >
              {links.map((l) => (
                <li key={l.to}>
                  <NavLink
                    to={l.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `block rounded-xl px-4 py-3 text-base font-bold ${
                        isActive ? 'bg-blush-100 text-blush-700' : 'text-plum-800'
                      }`
                    }
                  >
                    {l.label}
                  </NavLink>
                </li>
              ))}
              <li className="mt-2 border-t border-blush-100 pt-3">
                {authed ? (
                  <button
                    onClick={() => {
                      logout()
                      setMobileOpen(false)
                    }}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-4 py-3 text-base font-bold text-plum-800"
                  >
                    <LogOut size={18} /> Log out ({userEmail})
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <Link
                      to="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 rounded-xl px-4 py-3 text-center text-base font-bold text-plum-800 hover:bg-blush-50"
                    >
                      Login
                    </Link>
                    <Link
                      to="/admin?mode=signup"
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 rounded-xl bg-plum-900 px-4 py-3 text-center text-base font-bold text-white"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </li>
              <li className="pb-3" />
            </motion.ul>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}
