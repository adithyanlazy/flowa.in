import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Heart, Menu, Search, ShoppingBag, X } from 'lucide-react'
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

export default function Navbar({ desktopOnly = false }) {
  const { cartCount, wishlist, setCartOpen, setSearchOpen } = useStore()
  const { content } = useAdmin()
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
        <nav className={`mx-auto flex max-w-7xl items-center justify-between gap-4 py-3 ${desktopOnly ? 'px-6' : 'px-4 sm:px-6'}`}>
          <Logo />

          <ul className={`items-center gap-1 ${desktopOnly ? 'flex' : 'hidden md:flex'}`}>
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
            {!desktopOnly && (
              <button
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Toggle menu"
                className="grid h-11 w-11 cursor-pointer place-items-center rounded-full text-plum-800 transition-colors hover:bg-blush-100 md:hidden"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
          </div>
        </nav>

        <AnimatePresence>
          {!desktopOnly && mobileOpen && (
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
              <li className="pb-3" />
            </motion.ul>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}
