import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Heart, Instagram, LayoutDashboard, LogOut, Menu, Package, Search, ShoppingBag, X } from 'lucide-react'
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
  const { content, isLoggedIn, isAdmin, userEmail, logout } = useAdmin()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const accountRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!accountOpen) return
    const onClickOutside = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [accountOpen])

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
            {content.instagramUrl && (
              <a
                href={content.instagramUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Flowa on Instagram"
                className="grid h-11 w-11 place-items-center rounded-full text-plum-800 transition-colors hover:bg-blush-100"
              >
                <Instagram size={20} />
              </a>
            )}
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
            {isLoggedIn ? (
              <div className="relative" ref={accountRef}>
                <button
                  onClick={() => setAccountOpen((v) => !v)}
                  aria-label="Account menu"
                  aria-expanded={accountOpen}
                  className={`flex cursor-pointer items-center gap-2 rounded-full py-1 pl-1 pr-2.5 transition-colors ${
                    accountOpen ? 'bg-blush-100' : 'hover:bg-blush-50'
                  }`}
                >
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-plum-900 text-xs font-bold text-white">
                    {userEmail?.[0]?.toUpperCase()}
                  </span>
                  <ChevronDown size={15} className={`text-plum-800/60 transition-transform duration-200 ${accountOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {accountOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute right-0 top-full mt-2 w-64 origin-top-right overflow-hidden rounded-2xl bg-white p-2 shadow-soft"
                    >
                      <p className="truncate px-3 pb-2 pt-1.5 text-xs font-semibold text-plum-800/50">{userEmail}</p>
                      <Link
                        to="/orders"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold text-plum-800 transition-colors hover:bg-blush-50 hover:text-blush-600"
                      >
                        <Package size={16} /> My Orders
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold text-blush-600 transition-colors hover:bg-blush-50"
                        >
                          <LayoutDashboard size={16} /> Admin Panel
                        </Link>
                      )}
                      <div className="my-1.5 border-t border-blush-100" />
                      <button
                        onClick={() => {
                          logout()
                          setAccountOpen(false)
                        }}
                        className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-plum-800/60 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <LogOut size={16} /> Log out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-full px-4 py-2 text-sm font-bold text-plum-800 transition-colors hover:bg-blush-50 hover:text-blush-600"
                >
                  Login
                </Link>
                <Link
                  to="/login?mode=signup"
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
                {isLoggedIn ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2.5 px-4 py-2">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-plum-900 text-xs font-bold text-white">
                        {userEmail?.[0]?.toUpperCase()}
                      </span>
                      <span className="truncate text-sm font-semibold text-plum-800/60">{userEmail}</span>
                    </div>
                    <Link
                      to="/orders"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-4 py-3 text-base font-bold text-plum-800"
                    >
                      <Package size={18} /> My Orders
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 rounded-xl bg-blush-50 px-4 py-3 text-base font-bold text-blush-600"
                      >
                        <LayoutDashboard size={18} /> Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout()
                        setMobileOpen(false)
                      }}
                      className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-4 py-3 text-base font-bold text-plum-800"
                    >
                      <LogOut size={18} /> Log out
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 rounded-xl px-4 py-3 text-center text-base font-bold text-plum-800 hover:bg-blush-50"
                    >
                      Login
                    </Link>
                    <Link
                      to="/login?mode=signup"
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
