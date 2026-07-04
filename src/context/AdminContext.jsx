import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { products as baseProducts, reviews as baseReviews, faqs as baseFaqs } from '../data/products.js'
import { supabase, supabaseEnabled } from '../lib/supabase.js'

const AdminContext = createContext(null)

const ROW_ID = 'flowa'
const LS_KEY = 'flowa-admin-state'
const LS_AUTH_KEY = 'flowa-admin-auth'

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
  aboutTitle: 'We started Flowa because period care in India felt like an afterthought',
  aboutBody:
    'Scratchy pads wrapped in newspaper. Cramps dismissed as drama. Chemists who hand you a black plastic bag like you are buying something shameful. We thought: what if a period box felt like a gift from someone who truly gets it? So we built one — soft, honest, chemical-free, and delivered with zero judgment.',
  heroImage: '/images/hero.jpg',
}

export const defaultTheme = {
  '--color-blush-500': '#ec4899',
  '--color-plum-900': '#831843',
  '--color-lav-500': '#8b5cf6',
}

const ADMIN_PASSCODE = 'flowa2026'

const defaultData = {
  overrides: {},
  customProducts: [],
  hiddenIds: [],
  order: null,
  reviews: baseReviews,
  faqs: baseFaqs,
  content: defaultSiteContent,
  theme: defaultTheme,
}

function loadCache() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? { ...defaultData, ...JSON.parse(raw) } : defaultData
  } catch {
    return defaultData
  }
}
function saveCache(data) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data))
  } catch (err) {
    console.error('Flowa admin: failed to cache state locally', err)
  }
}
function loadAuth() {
  try {
    return localStorage.getItem(LS_AUTH_KEY) === '1'
  } catch {
    return false
  }
}
function saveAuth(v) {
  try {
    localStorage.setItem(LS_AUTH_KEY, v ? '1' : '0')
  } catch {
    // ignore
  }
}

function applyTheme(theme) {
  const root = document.documentElement
  Object.entries(theme).forEach(([k, v]) => root.style.setProperty(k, v))
}

export function AdminProvider({ children }) {
  const [data, setData] = useState(loadCache)
  const [authed, setAuthed] = useState(loadAuth)
  const [loaded, setLoaded] = useState(!supabaseEnabled)
  const skipNextSync = useRef(false)
  const saveTimer = useRef(null)

  useEffect(() => applyTheme(data.theme), [data.theme])

  // Initial fetch from Supabase + realtime subscription so other devices see admin edits.
  // Writes are blocked (see persist effect below) until this resolves, so a slow/failed
  // fetch can never race the debounced save and clobber the shared row with local defaults.
  useEffect(() => {
    if (!supabaseEnabled) return
    let channel
    let cancelled = false
    ;(async () => {
      const { data: row, error } = await supabase
        .from('store_state')
        .select('data')
        .eq('id', ROW_ID)
        .maybeSingle()
      if (!cancelled) {
        if (!error && row?.data && Object.keys(row.data).length) {
          skipNextSync.current = true
          setData({ ...defaultData, ...row.data })
        }
        setLoaded(true)
      }

      channel = supabase
        .channel('store_state_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'store_state', filter: `id=eq.${ROW_ID}` },
          (payload) => {
            if (payload.new?.data) {
              skipNextSync.current = true
              setData({ ...defaultData, ...payload.new.data })
            }
          },
        )
        .subscribe()
    })()
    return () => {
      cancelled = true
      if (channel) supabase.removeChannel(channel)
    }
  }, [])

  // Persist: localStorage cache always (instant, offline-safe); Supabase debounced (shared, cross-device).
  // Gated on `loaded` so we never push local defaults over real remote data before the initial fetch lands.
  useEffect(() => {
    saveCache(data)
    if (skipNextSync.current) {
      skipNextSync.current = false
      return
    }
    if (!supabaseEnabled || !loaded) return
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      supabase
        .from('store_state')
        .upsert({ id: ROW_ID, data, updated_at: new Date().toISOString() })
        .then(({ error }) => {
          if (error) console.error('Flowa admin: failed to sync to Supabase', error)
        })
    }, 500)
    return () => clearTimeout(saveTimer.current)
  }, [data, loaded])

  useEffect(() => saveAuth(authed), [authed])

  const { overrides, customProducts, hiddenIds, order, reviews, faqs, content, theme } = data

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
    setData((d) =>
      d.customProducts.some((p) => p.id === id)
        ? { ...d, customProducts: d.customProducts.map((p) => (p.id === id ? { ...p, ...patch } : p)) }
        : { ...d, overrides: { ...d.overrides, [id]: { ...d.overrides[id], ...patch } } },
    )
  }

  const addProduct = (product) => {
    const id = product.id || `custom-${Date.now()}`
    setData((d) => ({ ...d, customProducts: [...d.customProducts, { ...product, id }] }))
    return id
  }

  const deleteProduct = (id) => {
    setData((d) =>
      d.customProducts.some((p) => p.id === id)
        ? { ...d, customProducts: d.customProducts.filter((p) => p.id !== id) }
        : d.hiddenIds.includes(id)
          ? d
          : { ...d, hiddenIds: [...d.hiddenIds, id] },
    )
  }

  const restoreProduct = (id) => setData((d) => ({ ...d, hiddenIds: d.hiddenIds.filter((x) => x !== id) }))

  const resetProduct = (id) =>
    setData((d) => {
      const next = { ...d.overrides }
      delete next[id]
      return { ...d, overrides: next }
    })

  const getProduct = (id) => products.find((p) => p.id === id)

  const setSiteContent = (patch) => setData((d) => ({ ...d, content: { ...d.content, ...patch } }))
  const setThemeColor = (patch) => setData((d) => ({ ...d, theme: { ...d.theme, ...patch } }))
  const setReviews = (next) => setData((d) => ({ ...d, reviews: next }))
  const setFaqs = (next) => setData((d) => ({ ...d, faqs: next }))

  const resetAll = () => setData({ ...defaultData })

  const exportData = () => JSON.stringify(data, null, 2)

  const importData = (json) => {
    const parsed = JSON.parse(json)
    setData((d) => ({
      ...d,
      ...(parsed.overrides && { overrides: parsed.overrides }),
      ...(parsed.customProducts && { customProducts: parsed.customProducts }),
      ...(parsed.hiddenIds && { hiddenIds: parsed.hiddenIds }),
      ...(parsed.order !== undefined && { order: parsed.order }),
      ...(parsed.reviews && { reviews: parsed.reviews }),
      ...(parsed.faqs && { faqs: parsed.faqs }),
      ...(parsed.content && { content: { ...defaultSiteContent, ...parsed.content } }),
      ...(parsed.theme && { theme: { ...defaultTheme, ...parsed.theme } }),
    }))
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
    setReviews,
    setFaqs,
    setSiteContent,
    setThemeColor,
    resetAll,
    exportData,
    importData,
  }

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export const useAdmin = () => useContext(AdminContext)
