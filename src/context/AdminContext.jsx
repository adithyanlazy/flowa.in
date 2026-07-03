import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { products as baseProducts, reviews as baseReviews, faqs as baseFaqs } from '../data/products.js'

const AdminContext = createContext(null)

const LS_KEYS = {
  overrides: 'flowa-admin-product-overrides',
  custom: 'flowa-admin-custom-products',
  hidden: 'flowa-admin-hidden-products',
  order: 'flowa-admin-product-order',
  reviews: 'flowa-admin-reviews',
  faqs: 'flowa-admin-faqs',
  content: 'flowa-admin-site-content',
  theme: 'flowa-admin-theme',
  auth: 'flowa-admin-auth',
}

export const defaultSiteContent = {
  announcement: 'Free delivery on every order · Pay on Delivery available across India',
  heroTitlePrefix: 'Period care that feels like a ',
  heroTitleHighlight: 'warm hug',
  heroSubtitle:
    'Chemical-free cotton pads, herbal cramp relief and a little chocolate — thoughtfully boxed, discreetly delivered, paid only when it reaches you.',
  trustBadge: 'Trusted by 50,000+ women across India',
  reviewsBlurb: 'from 200+ verified reviews',
  whatsappNumber: '919061064554',
  contactPhone: '+91 90610 64554',
  contactEmail: 'hello@flowa.in',
  footerTagline:
    'Thoughtful period care, delivered with love. Chemical-free essentials and real cramp relief for 50,000+ women across India.',
  finalCtaTitle: 'Your next period deserves better. Let us take care of it.',
}

export const defaultTheme = {
  '--color-blush-500': '#ec4899',
  '--color-plum-900': '#831843',
  '--color-lav-500': '#8b5cf6',
}

const ADMIN_PASSCODE = 'flowa2026'

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}
function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable */
  }
}

function applyTheme(theme) {
  const root = document.documentElement
  Object.entries(theme).forEach(([k, v]) => root.style.setProperty(k, v))
}

export function AdminProvider({ children }) {
  const [overrides, setOverrides] = useState(() => load(LS_KEYS.overrides, {}))
  const [customProducts, setCustomProducts] = useState(() => load(LS_KEYS.custom, []))
  const [hiddenIds, setHiddenIds] = useState(() => load(LS_KEYS.hidden, []))
  const [order, setOrder] = useState(() => load(LS_KEYS.order, null))
  const [reviews, setReviewsState] = useState(() => load(LS_KEYS.reviews, baseReviews))
  const [faqs, setFaqsState] = useState(() => load(LS_KEYS.faqs, baseFaqs))
  const [content, setContentState] = useState(() => ({ ...defaultSiteContent, ...load(LS_KEYS.content, {}) }))
  const [theme, setThemeState] = useState(() => ({ ...defaultTheme, ...load(LS_KEYS.theme, {}) }))
  const [authed, setAuthed] = useState(() => load(LS_KEYS.auth, false))

  useEffect(() => applyTheme(theme), [theme])
  useEffect(() => save(LS_KEYS.overrides, overrides), [overrides])
  useEffect(() => save(LS_KEYS.custom, customProducts), [customProducts])
  useEffect(() => save(LS_KEYS.hidden, hiddenIds), [hiddenIds])
  useEffect(() => save(LS_KEYS.order, order), [order])
  useEffect(() => save(LS_KEYS.reviews, reviews), [reviews])
  useEffect(() => save(LS_KEYS.faqs, faqs), [faqs])
  useEffect(() => save(LS_KEYS.content, content), [content])
  useEffect(() => save(LS_KEYS.theme, theme), [theme])
  useEffect(() => save(LS_KEYS.auth, authed), [authed])

  const products = useMemo(() => {
    const merged = baseProducts.map((p) => ({ ...p, ...overrides[p.id] }))
    let all = [...merged, ...customProducts].filter((p) => !hiddenIds.includes(p.id))
    if (order?.length) {
      const idx = (id) => {
        const i = order.indexOf(id)
        return i === -1 ? order.length : i
      }
      all = [...all].sort((a, b) => idx(a.id) - idx(b.id))
    }
    return all
  }, [overrides, customProducts, hiddenIds, order])

  const isCustom = (id) => customProducts.some((p) => p.id === id)

  const updateProduct = (id, patch) => {
    if (isCustom(id)) {
      setCustomProducts((list) => list.map((p) => (p.id === id ? { ...p, ...patch } : p)))
    } else {
      setOverrides((o) => ({ ...o, [id]: { ...o[id], ...patch } }))
    }
  }

  const addProduct = (product) => {
    const id = product.id || `custom-${Date.now()}`
    setCustomProducts((list) => [...list, { ...product, id }])
    return id
  }

  const deleteProduct = (id) => {
    if (isCustom(id)) {
      setCustomProducts((list) => list.filter((p) => p.id !== id))
    } else {
      setHiddenIds((ids) => (ids.includes(id) ? ids : [...ids, id]))
    }
  }

  const restoreProduct = (id) => setHiddenIds((ids) => ids.filter((x) => x !== id))

  const resetProduct = (id) => setOverrides((o) => { const next = { ...o }; delete next[id]; return next })

  const getProduct = (id) => products.find((p) => p.id === id)

  const setSiteContent = (patch) => setContentState((c) => ({ ...c, ...patch }))
  const setThemeColor = (patch) => setThemeState((t) => ({ ...t, ...patch }))

  const resetAll = () => {
    setOverrides({})
    setCustomProducts([])
    setHiddenIds([])
    setOrder(null)
    setReviewsState(baseReviews)
    setFaqsState(baseFaqs)
    setContentState(defaultSiteContent)
    setThemeState(defaultTheme)
  }

  const exportData = () =>
    JSON.stringify(
      { overrides, customProducts, hiddenIds, order, reviews, faqs, content, theme },
      null,
      2,
    )

  const importData = (json) => {
    const data = JSON.parse(json)
    if (data.overrides) setOverrides(data.overrides)
    if (data.customProducts) setCustomProducts(data.customProducts)
    if (data.hiddenIds) setHiddenIds(data.hiddenIds)
    if (data.order !== undefined) setOrder(data.order)
    if (data.reviews) setReviewsState(data.reviews)
    if (data.faqs) setFaqsState(data.faqs)
    if (data.content) setContentState({ ...defaultSiteContent, ...data.content })
    if (data.theme) setThemeState({ ...defaultTheme, ...data.theme })
  }

  const login = (pass) => {
    if (pass === ADMIN_PASSCODE) {
      setAuthed(true)
      return true
    }
    return false
  }
  const logout = () => setAuthed(false)

  const value = {
    products,
    reviews,
    faqs,
    content,
    theme,
    authed,
    login,
    logout,
    getProduct,
    updateProduct,
    addProduct,
    deleteProduct,
    restoreProduct,
    resetProduct,
    hiddenIds,
    baseProducts,
    isCustom,
    setReviews: setReviewsState,
    setFaqs: setFaqsState,
    setSiteContent,
    setThemeColor,
    resetAll,
    exportData,
    importData,
  }

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export const useAdmin = () => useContext(AdminContext)
