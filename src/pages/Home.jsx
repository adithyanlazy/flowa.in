import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BadgeCheck,
  Box,
  HandHeart,
  Heart,
  Leaf,
  MessageCircle,
  Package,
  ShieldCheck,
  Sparkles,
  Truck,
} from 'lucide-react'
import PageWrap from '../components/PageWrap.jsx'
import ProductCard from '../components/ProductCard.jsx'
import ProductVisual from '../components/ProductVisual.jsx'
import Stars from '../components/Stars.jsx'
import Avatar from '../components/Avatar.jsx'
import Accordion from '../components/Accordion.jsx'
import { useAdmin } from '../context/AdminContext.jsx'

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, ease: 'easeOut' },
}

const marqueeItems = [
  { icon: Truck, text: 'Free delivery, always' },
  { icon: Package, text: '100% discreet packaging' },
  { icon: Leaf, text: 'Chemical-free cotton' },
  { icon: HandHeart, text: 'Pay on delivery' },
  { icon: ShieldCheck, text: 'Dermat tested' },
  { icon: Heart, text: '1000+ women trust Flowa' },
]

function Hero() {
  const { products, content } = useAdmin()
  const featured = products[0]
  const slides = content.heroSlides?.length ? content.heroSlides : []

  const [active, setActive] = useState(0)
  const scrollerRef = useRef(null)
  const scrollRaf = useRef(null)
  const pausedRef = useRef(false)

  const scrollToIndex = (i) => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' })
  }

  const handleScroll = () => {
    const el = scrollerRef.current
    if (!el || scrollRaf.current) return
    scrollRaf.current = requestAnimationFrame(() => {
      scrollRaf.current = null
      setActive(Math.round(el.scrollLeft / el.clientWidth))
    })
  }

  useEffect(() => {
    if (slides.length <= 1) return
    const id = setInterval(() => {
      if (!pausedRef.current) scrollToIndex((active + 1) % slides.length)
    }, 6000)
    return () => clearInterval(id)
  }, [active, slides.length])

  if (!featured || !slides.length) return null

  return (
    <section className="relative overflow-hidden">
      {/* top announcement bar */}
      <div className="bg-plum-900 py-2.5 text-center text-xs font-bold tracking-wide text-white">
        <span className="inline-flex items-center gap-1.5">
          <Truck size={14} className="text-blush-300" /> {content.trustBadge}
        </span>
      </div>

      <div className="group/slider relative h-[560px] w-full overflow-hidden sm:h-[580px] lg:h-[640px]">
        <div
          ref={scrollerRef}
          onScroll={handleScroll}
          onTouchStart={() => (pausedRef.current = true)}
          onTouchEnd={() => setTimeout(() => (pausedRef.current = false), 3000)}
          className="flex h-full w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden scroll-smooth [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {slides.map((s, i) => (
            <div key={s.id} className="relative h-full w-full flex-shrink-0 snap-center snap-always">
              {s.mediaType === 'video' ? (
                <video
                  src={s.mediaSrc}
                  className="absolute inset-0 h-full w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <img src={s.mediaSrc} alt="" className="absolute inset-0 h-full w-full object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-plum-900/80 via-plum-900/40 to-transparent" />
              <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-6">
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={i === active ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.15 }}
                  className="max-w-xl py-6"
                >
                  <h1 className="font-display text-4xl leading-[1.15] text-white sm:text-6xl">
                    {s.titlePrefix}
                    <span className="text-blush-300">{s.titleHighlight}</span>
                  </h1>
                  <p className="mt-4 max-w-md text-base leading-relaxed text-white/80 sm:mt-5 sm:text-lg">{s.subtitle}</p>
                  <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-8 sm:gap-4">
                    <Link
                      to="/shop"
                      className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-plum-900 shadow-lift transition-colors duration-200 hover:bg-blush-100 sm:px-8 sm:py-4"
                    >
                      Shop the kits
                      <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                    <Link
                      to="/customize"
                      className="inline-flex items-center gap-2 rounded-full border-2 border-white/70 px-6 py-3 text-sm font-bold text-white backdrop-blur transition-colors duration-200 hover:bg-white/10 sm:px-8 sm:py-4"
                    >
                      <Sparkles size={16} /> Customize your day
                    </Link>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-4 sm:mt-5">
                    <div className="flex items-center gap-2 text-white/90">
                      <Stars rating={4.8} showValue />
                      <span className="text-xs">{content.reviewsBlurb}</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          ))}
        </div>

        {/* persistent trust chip */}
        <div className="pointer-events-none absolute bottom-6 right-6 z-20 hidden items-center gap-2 rounded-2xl bg-white/95 px-4 py-3 shadow-lift sm:flex">
          <BadgeCheck size={18} className="text-emerald-500" />
          <div>
            <p className="text-xs font-bold text-plum-900">Rash-free promise</p>
            <p className="text-[11px] text-plum-800/60">100% cotton top sheet</p>
          </div>
        </div>

        {slides.length > 1 && (
          <>
            {/* arrows, revealed on hover */}
            <button
              type="button"
              onClick={() => scrollToIndex((active - 1 + slides.length) % slides.length)}
              aria-label="Previous slide"
              className="absolute left-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-white/90 p-2.5 opacity-0 shadow-lift transition-opacity duration-300 group-hover/slider:opacity-100 sm:flex"
            >
              <ArrowRight size={18} className="rotate-180 text-plum-900" />
            </button>
            <button
              type="button"
              onClick={() => scrollToIndex((active + 1) % slides.length)}
              aria-label="Next slide"
              className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-white/90 p-2.5 opacity-0 shadow-lift transition-opacity duration-300 group-hover/slider:opacity-100 sm:flex"
            >
              <ArrowRight size={18} className="text-plum-900" />
            </button>

            {/* dot navigation */}
            <div className="absolute inset-x-0 bottom-6 z-20 flex justify-center gap-3">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => scrollToIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === active ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}

function Marquee() {
  const row = [...marqueeItems, ...marqueeItems]
  return (
    <section className="border-y border-blush-100 bg-white py-4" aria-label="Why shop with Flowa">
      <div className="overflow-hidden">
        <div className="flex w-max animate-marquee gap-10 pr-10">
          {row.map((item, i) => (
            <span key={i} className="flex items-center gap-2 whitespace-nowrap text-sm font-bold text-plum-800">
              <item.icon size={16} className="text-blush-500" />
              {item.text}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

function Featured() {
  const { products } = useAdmin()
  const featured = products.slice(0, 4)
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <motion.div {...fadeUp} className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-blush-500">The collection</p>
          <h2 className="mt-2 font-display text-4xl text-plum-900">Kits women swear by</h2>
        </div>
        <div className="flex flex-wrap items-center gap-5">
          <Link
            to="/customize"
            className="group inline-flex items-center gap-2 text-sm font-bold text-blush-600 hover:text-blush-700"
          >
            <Sparkles size={15} /> Build your own kit
          </Link>
          <Link
            to="/shop"
            className="group inline-flex items-center gap-2 text-sm font-bold text-plum-900 hover:text-blush-600"
          >
            View all products
            <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </motion.div>
      <div className="-mx-6 flex gap-5 overflow-x-auto px-6 pb-2 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:px-0 lg:pb-0">
        {featured.map((p, i) => (
          <div key={p.id} className="w-80 shrink-0 lg:w-auto">
            <ProductCard product={p} index={i} />
          </div>
        ))}
      </div>
    </section>
  )
}

function InsideTheKit() {
  const { products } = useAdmin()
  const kit = products[0]
  if (!kit) return null
  return (
    <section className="bg-white py-20">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 lg:grid-cols-2 lg:gap-12">
        <motion.div {...fadeUp}>
          <ProductVisual product={kit} className="aspect-square w-full rounded-[2.5rem] shadow-soft" />
        </motion.div>
        <motion.div {...fadeUp}>
          <p className="text-sm font-bold uppercase tracking-widest text-blush-500">Inside every box</p>
          <h2 className="mt-2 font-display text-4xl text-plum-900">Packed like a care package from your best friend</h2>
          <ul className="mt-8 space-y-4">
            {kit.contents.map((c, i) => (
              <motion.li
                key={c}
                initial={{ opacity: 0, x: -18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex items-center gap-4 rounded-2xl bg-blush-50 px-5 py-4"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-blush-500 shadow-soft">
                  <Box size={18} />
                </span>
                <span className="font-semibold text-plum-900">{c}</span>
              </motion.li>
            ))}
          </ul>
          <Link
            to={`/product/${kit.id}`}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-plum-900 px-8 py-4 text-sm font-bold text-white transition-colors duration-200 hover:bg-blush-600"
          >
            Get the Complete Care Kit <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    { icon: Heart, title: 'Pick your kit', text: 'Choose the box that fits your flow — kits, combos or gifts for someone you love.' },
    { icon: Package, title: 'We pack it discreetly', text: 'Plain outer box, zero labels. Shipped within 24 hours with free delivery.' },
    { icon: HandHeart, title: 'Pay at your door', text: 'No advance payment. Check the box, then pay cash or UPI on delivery.' },
  ]
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <motion.div {...fadeUp} className="mb-12 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-blush-500">Simple by design</p>
        <h2 className="mt-2 font-display text-4xl text-plum-900">How Flowa works</h2>
      </motion.div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {steps.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: i * 0.12 }}
            className="relative rounded-3xl bg-white p-8 shadow-soft"
          >
            <span className="absolute right-6 top-6 font-display text-5xl text-blush-100">0{i + 1}</span>
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-blush-100 text-blush-600">
              <s.icon size={24} />
            </span>
            <h3 className="mt-6 font-display text-xl text-plum-900">{s.title}</h3>
            <p className="mt-2 leading-relaxed text-plum-800/70">{s.text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function Testimonials() {
  const { reviews } = useAdmin()
  return (
    <section className="overflow-hidden bg-gradient-to-b from-blush-50 to-cream py-20">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div {...fadeUp} className="mb-12 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-blush-500">Genuine stories</p>
          <h2 className="mt-2 font-display text-4xl text-plum-900">Remarkable relief, in their words</h2>
        </motion.div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r, i) => (
            <motion.figure
              key={r.name}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
              className="flex flex-col rounded-3xl bg-white p-7 shadow-soft"
            >
              <Stars rating={r.rating} />
              <blockquote className="mt-4 flex-1 leading-relaxed text-plum-800/80">“{r.text}”</blockquote>
              <figcaption className="mt-5 flex items-center justify-between border-t border-blush-100 pt-4">
                <div className="flex items-center gap-3">
                  <Avatar name={r.name} size={40} />
                  <div>
                    <p className="font-bold text-plum-900">{r.name}</p>
                    <p className="text-xs text-plum-800/50">{r.location} · {r.product}</p>
                  </div>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  <BadgeCheck size={13} /> Verified
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  )
}

function FaqPreview() {
  const { faqs } = useAdmin()
  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <motion.div {...fadeUp} className="mb-10 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-blush-500">Good to know</p>
        <h2 className="mt-2 font-display text-4xl text-plum-900">Questions, answered gently</h2>
      </motion.div>
      <Accordion items={faqs.slice(0, 4)} />
      <motion.div {...fadeUp} className="mt-8 text-center">
        <Link to="/faq" className="inline-flex items-center gap-2 text-sm font-bold text-plum-900 hover:text-blush-600">
          See all FAQs <ArrowRight size={15} />
        </Link>
      </motion.div>
    </section>
  )
}

function FinalCta() {
  const { content } = useAdmin()
  return (
    <section className="mx-auto max-w-7xl px-6">
      <motion.div
        {...fadeUp}
        className="relative overflow-hidden rounded-[2.5rem] bg-plum-900 px-6 py-12 text-center sm:px-16 sm:py-16"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-blush-500/30 blur-3xl" />
          <div className="absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-lav-500/30 blur-3xl" />
        </div>
        <div className="relative">
          <h2 className="mx-auto max-w-2xl font-display text-4xl leading-snug text-white">
            {content.finalCtaTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-blush-100/80">
            Free delivery · Discreet box · Pay only when it arrives
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/shop"
              className="rounded-full bg-blush-500 px-8 py-4 text-sm font-bold text-white transition-colors duration-200 hover:bg-blush-400"
            >
              Shop now
            </Link>
            <a
              href={`https://wa.me/${content.whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-8 py-4 text-sm font-bold text-white backdrop-blur transition-colors duration-200 hover:bg-white/20"
            >
              <MessageCircle size={16} /> Ask us anything
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

export default function Home() {
  return (
    <PageWrap>
      <Hero />
      <Marquee />
      <Featured />
      <InsideTheKit />
      <HowItWorks />
      <Testimonials />
      <FaqPreview />
      <FinalCta />
    </PageWrap>
  )
}
