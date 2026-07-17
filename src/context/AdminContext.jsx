import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { products as baseProducts, reviews as baseReviews, faqs as baseFaqs } from '../data/products.js'
import { supabase, supabaseEnabled } from '../lib/supabase.js'

const AdminContext = createContext(null)

const ROW_ID = 'flowa'
const LS_KEY = 'flowa-admin-state'

// Hero slides moved off the old flat heroTitlePrefix/heroImage/etc fields (kept
// below only so buildLegacyHeroSlides can migrate any already-stored data) into
// this array so admins can add/reorder/remove up to 5 slides, each with its own
// title, subtitle and background image or video.
export const defaultHeroSlides = [
  {
    id: 'slide-1',
    mediaType: 'image',
    mediaSrc: '/images/hero.jpg',
    titlePrefix: 'Period care that feels like a ',
    titleHighlight: 'warm hug',
    subtitle:
      'Chemical-free cotton pads, herbal cramp relief and a little chocolate — thoughtfully boxed, discreetly delivered, paid only when it reaches you.',
  },
  {
    id: 'slide-2',
    mediaType: 'image',
    mediaSrc: baseProducts[6]?.photo || baseProducts[1]?.photo || '/images/hero.jpg',
    titlePrefix: 'Everything you need, ',
    titleHighlight: 'in one pack.',
    subtitle: 'Pads, patches and comfort essentials — delivered discreetly, right on time.',
  },
]

function buildLegacyHeroSlides(rawContent) {
  if (!rawContent || (!rawContent.heroTitlePrefix && !rawContent.heroImage && !rawContent.heroImage2)) return null
  return [
    {
      id: 'slide-1',
      mediaType: 'image',
      mediaSrc: rawContent.heroImage || defaultHeroSlides[0].mediaSrc,
      titlePrefix: rawContent.heroTitlePrefix ?? defaultHeroSlides[0].titlePrefix,
      titleHighlight: rawContent.heroTitleHighlight ?? defaultHeroSlides[0].titleHighlight,
      subtitle: rawContent.heroSubtitle ?? defaultHeroSlides[0].subtitle,
    },
    {
      id: 'slide-2',
      mediaType: 'image',
      mediaSrc: rawContent.heroImage2 || defaultHeroSlides[1].mediaSrc,
      titlePrefix: defaultHeroSlides[1].titlePrefix,
      titleHighlight: defaultHeroSlides[1].titleHighlight,
      subtitle: defaultHeroSlides[1].subtitle,
    },
  ]
}

export const defaultSiteContent = {
  announcement: 'Free delivery on every order · Pay on Delivery available across Bangalore',
  heroSlides: defaultHeroSlides,
  trustBadge: 'Trusted by 1000+ women across Bangalore',
  reviewsBlurb: 'from 200+ verified reviews',
  instagramUrl: 'https://instagram.com',
  whatsappNumber: '919061064554',
  contactPhone: '+91 90610 64554',
  contactEmail: 'hello@flowa.in',
  footerTagline:
    'Thoughtful period care, delivered with love. Chemical-free essentials and real cramp relief for 1000+ women across Bangalore.',
  finalCtaTitle: 'Your next period deserves better. Let us take care of it.',
  aboutTitle: 'We started Flowa because period care in India felt like an afterthought',
  aboutBody:
    'Scratchy pads wrapped in newspaper. Cramps dismissed as drama. Chemists who hand you a black plastic bag like you are buying something shameful. We thought: what if a period box felt like a gift from someone who truly gets it? So we built one — soft, honest, chemical-free, and delivered with zero judgment.',
}

export const defaultTheme = {
  '--color-blush-500': '#ec4899',
  '--color-plum-900': '#831843',
  '--color-lav-500': '#8b5cf6',
}

const defaultData = {
  overrides: {},
  customProducts: [],
  hiddenIds: [],
  order: null,
  reviews: baseReviews,
  faqs: baseFaqs,
  content: defaultSiteContent,
  theme: defaultTheme,
  kitItems: [],
}

// Shallow-spreading `defaultData` over stored/remote data would let a stale
// `content`/`theme` object (cached before a new default key was added, e.g.
// heroImage2) silently wipe that key out — deep-merge those two nested configs.
function mergeStoredData(incoming) {
  const incomingContent = incoming?.content || {}
  const heroSlides =
    Array.isArray(incomingContent.heroSlides) && incomingContent.heroSlides.length
      ? incomingContent.heroSlides
      : buildLegacyHeroSlides(incomingContent) || defaultHeroSlides
  return {
    ...defaultData,
    ...incoming,
    content: { ...defaultSiteContent, ...incomingContent, heroSlides },
    theme: { ...defaultTheme, ...(incoming?.theme || {}) },
  }
}

function loadCache() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? mergeStoredData(JSON.parse(raw)) : defaultData
  } catch {
    return defaultData
  }
}
function saveCache(data) {
  try {
    const json = JSON.stringify(data)
    // localStorage quota is ~5MB shared across the whole origin — if the state
    // somehow gets that big again (e.g. inlined media), skip the cache quietly
    // and let Supabase remain the source of truth instead of throwing on every
    // state change.
    if (json.length > 4_000_000) return
    localStorage.setItem(LS_KEY, json)
  } catch (err) {
    console.error('Flowa admin: failed to cache state locally', err)
  }
}
function applyTheme(theme) {
  const root = document.documentElement
  Object.entries(theme).forEach(([k, v]) => root.style.setProperty(k, v))
}

export function AdminProvider({ children }) {
  const [data, setData] = useState(loadCache)
  const [loaded, setLoaded] = useState(!supabaseEnabled)
  const skipNextSync = useRef(false)
  const saveTimer = useRef(null)

  // Real admin auth (Supabase Auth) — replaces the old client-side-only
  // passcode, which anyone could read out of the bundled JS. Signing up
  // alone grants no access: `profiles.is_admin` defaults false and is only
  // flippable from the Supabase SQL editor (see scripts/supabase-schema.sql).
  const [session, setSession] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  // Single "still figuring out auth" flag — only ever cleared once we've
  // reached a final answer (no session, or session + is_admin resolved).
  // Two separately-cleared flags here previously let a real admin's page
  // refresh render a false "Access pending" frame: the session resolved
  // (loading -> false) one tick before the is_admin fetch effect even
  // started (its own loading -> true hadn't fired yet), so pendingApproval
  // read as true for that frame.
  const [resolvingAuth, setResolvingAuth] = useState(true)

  useEffect(() => {
    if (!supabaseEnabled) {
      setResolvingAuth(false)
      return
    }
    let cancelled = false
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return
      setSession(session)
      if (!session) setResolvingAuth(false) // no session → nothing left to resolve
      // else: stays "resolving" until the is_admin effect below finishes
    })
    const { data: listener } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next)
      // Only re-enter "resolving" for a real sign-in/out transition — Supabase
      // also fires this on silent background token refreshes (~hourly) with a
      // new session object every time; treating those as "resolving" would
      // briefly kick a signed-in admin back to the full-page spinner for no
      // reason.
      if (event === 'SIGNED_IN') setResolvingAuth(true)
      else if (event === 'SIGNED_OUT') setResolvingAuth(false)
    })
    return () => {
      cancelled = true
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!session) {
      setIsAdmin(false)
      return
    }
    let cancelled = false
    supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .maybeSingle()
      .then(({ data: row, error }) => {
        if (!cancelled) {
          setIsAdmin(!error && row?.is_admin === true)
          setResolvingAuth(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [session])

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
          setData(mergeStoredData(row.data))
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
              setData(mergeStoredData(payload.new.data))
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

  const { overrides, customProducts, hiddenIds, order, reviews, faqs, content, theme, kitItems } = data

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

  // Kit Builder: a separate, admin-managed catalog of pickable items for the
  // "Customize your day" build-your-own-kit feature — intentionally kept out
  // of `products`/`customProducts` so it never shows up in the shop catalog.
  const addKitItem = (item) => {
    const id = item.id || `kit-item-${Date.now()}`
    setData((d) => ({ ...d, kitItems: [...d.kitItems, { ...item, id }] }))
    return id
  }
  const updateKitItem = (id, patch) =>
    setData((d) => ({ ...d, kitItems: d.kitItems.map((k) => (k.id === id ? { ...k, ...patch } : k)) }))
  const deleteKitItem = (id) => setData((d) => ({ ...d, kitItems: d.kitItems.filter((k) => k.id !== id) }))

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

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error ? error.message : null
  }

  const signUp = async (email, password, fullName) => {
    const { data: signUpData, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) return { error: error.message }
    return { error: null, needsConfirmation: !signUpData.session }
  }

  const logout = () => supabase.auth.signOut()

  const isLoggedIn = Boolean(session)
  const authed = isLoggedIn && isAdmin
  const pendingApproval = isLoggedIn && !isAdmin

  const value = {
    products,
    reviews,
    faqs,
    content,
    theme,
    isLoggedIn,
    isAdmin,
    authed,
    authLoading: resolvingAuth,
    pendingApproval,
    userEmail: session?.user?.email,
    userId: session?.user?.id,
    signIn,
    signUp,
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
    kitItems,
    addKitItem,
    updateKitItem,
    deleteKitItem,
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
