import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react'

const StoreContext = createContext(null)

const load = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'add': {
      const existing = state.find((i) => i.id === action.id)
      if (existing) {
        return state.map((i) => (i.id === action.id ? { ...i, qty: Math.min(i.qty + action.qty, 10) } : i))
      }
      return [...state, { id: action.id, qty: action.qty }]
    }
    case 'setQty':
      if (action.qty <= 0) return state.filter((i) => i.id !== action.id)
      return state.map((i) => (i.id === action.id ? { ...i, qty: Math.min(action.qty, 10) } : i))
    case 'remove':
      return state.filter((i) => i.id !== action.id)
    case 'clear':
      return []
    default:
      return state
  }
}

export function StoreProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, undefined, () => load('flowa-cart', []))
  const [wishlist, setWishlist] = useState(() => load('flowa-wishlist', []))
  const [cartOpen, setCartOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const [lastOrder, setLastOrderState] = useState(() => {
    try {
      const raw = sessionStorage.getItem('flowa-last-order')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  const setLastOrder = (order) => {
    setLastOrderState(order)
    try {
      sessionStorage.setItem('flowa-last-order', JSON.stringify(order))
    } catch {
      /* storage unavailable */
    }
  }

  useEffect(() => localStorage.setItem('flowa-cart', JSON.stringify(cart)), [cart])
  useEffect(() => localStorage.setItem('flowa-wishlist', JSON.stringify(wishlist)), [wishlist])

  const showToast = (message) => {
    setToast({ id: Date.now(), message })
  }

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3200)
    return () => clearTimeout(t)
  }, [toast])

  const addToCart = (id, qty = 1, { open = true } = {}) => {
    dispatch({ type: 'add', id, qty })
    if (open) setCartOpen(true)
  }

  const toggleWishlist = (id) => {
    setWishlist((w) => {
      const has = w.includes(id)
      showToast(has ? 'Removed from wishlist' : 'Saved to your wishlist ♥')
      return has ? w.filter((x) => x !== id) : [...w, id]
    })
  }

  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart])

  const value = {
    cart,
    dispatch,
    addToCart,
    cartCount,
    wishlist,
    toggleWishlist,
    cartOpen,
    setCartOpen,
    searchOpen,
    setSearchOpen,
    toast,
    showToast,
    lastOrder,
    setLastOrder,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export const useStore = () => useContext(StoreContext)
