import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BadgeCheck,
  Box,
  Flower2,
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
  { icon: Heart, text: '50,000+ women trust Flowa' },
]

function Hero() {
  const { products, content } = useAdmin()
  const featured = products[0]
  const second = products[6] || products[products.length - 1]
  if (!featured) return null
  return (
    <section className="relative overflow-hidden">
      {/* ambient blobs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-blush-200/60 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -24, 0], y: [0, 24, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -right-20 top-40 h-80 w-80 rounded-full bg-lav-200/60 blur-3xl"
        />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-2 lg:pt-20">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-plum-800 shadow-soft"
          >
            <Sparkles size={14} className="text-blush-500" />
            {content.trustBadge}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="font-display text-4xl leading-[1.12] text-plum-900 sm:text-5xl lg:text-6xl"
          >
            {content.heroTitlePrefix}
            <span className="text-blush-500">{content.heroTitleHighlight}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16 }}
            className="mt-5 max-w-md text-lg leading-relaxed text-plum-800/70"
          >
            {content.heroSubtitle}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24 }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <Link
              to="/shop"
              className="group inline-flex items-center gap-2 rounded-full bg-plum-900 px-8 py-4 text-sm font-bold text-white shadow-lift transition-colors duration-200 hover:bg-blush-600"
            >
              Shop the kits
              <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold text-plum-900 shadow-soft transition-colors duration-200 hover:bg-blush-100"
            >
              Our story
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 flex items-center gap-3"
          >
            <div className="flex -space-x-2" aria-hidden="true">
              {['#f9a8d4', '#c4b5fd', '#fda4af', '#86efac'].map((c, i) => (
                <span key={i} className="grid h-9 w-9 place-items-center rounded-full border-2 border-cream" style={{ background: c }}>
                  <Flower2 size={15} className="text-white" />
                </span>
              ))}
            </div>
            <div className="text-sm">
              <Stars rating={4.8} showValue />
              <p className="text-plum-800/60">{content.reviewsBlurb}</p>
            </div>
          </motion.div>
        </div>

        {/* hero visual collage */}
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative"
          >
            <Link to={`/product/${featured.id}`} className="block overflow-hidden rounded-[2.5rem] shadow-lift">
              <img src="/images/hero.jpg" alt="Flowa cotton pads and chocolate, flat lay" className="aspect-[5/4] w-full object-cover" />
            </Link>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -left-6 -top-6 rounded-3xl bg-white p-4 shadow-lift"
            >
              <p className="flex items-center gap-2 text-sm font-bold text-plum-900">
                <BadgeCheck size={18} className="text-emerald-500" /> Rash-free promise
              </p>
              <p className="mt-0.5 text-xs text-plum-800/60">100% cotton top sheet</p>
            </motion.div>
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -bottom-8 -right-4 flex items-center gap-3 rounded-3xl bg-white p-3 pr-5 shadow-lift sm:-right-8"
            >
              <ProductVisual product={second} className="h-16 w-16 rounded-2xl" />
              <div>
                <p className="text-sm font-bold text-plum-900">Cramp relief patches</p>
                <p className="text-xs text-plum-800/60">Relief in ~15 minutes</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
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
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <motion.div {...fadeUp} className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-blush-500">The collection</p>
          <h2 className="mt-2 font-display text-3xl text-plum-900 sm:text-4xl">Kits women swear by</h2>
        </div>
        <Link
          to="/shop"
          className="group inline-flex items-center gap-2 text-sm font-bold text-plum-900 hover:text-blush-600"
        >
          View all products
          <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </motion.div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {featured.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
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
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <motion.div {...fadeUp}>
          <ProductVisual product={kit} className="aspect-square w-full rounded-[2.5rem] shadow-soft" />
        </motion.div>
        <motion.div {...fadeUp}>
          <p className="text-sm font-bold uppercase tracking-widest text-blush-500">Inside every box</p>
          <h2 className="mt-2 font-display text-3xl text-plum-900 sm:text-4xl">Packed like a care package from your best friend</h2>
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
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <motion.div {...fadeUp} className="mb-12 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-blush-500">Simple by design</p>
        <h2 className="mt-2 font-display text-3xl text-plum-900 sm:text-4xl">How Flowa works</h2>
      </motion.div>
      <div className="grid gap-6 md:grid-cols-3">
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
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div {...fadeUp} className="mb-12 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-blush-500">Genuine stories</p>
          <h2 className="mt-2 font-display text-3xl text-plum-900 sm:text-4xl">Remarkable relief, in their words</h2>
        </motion.div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
    <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <motion.div {...fadeUp} className="mb-10 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-blush-500">Good to know</p>
        <h2 className="mt-2 font-display text-3xl text-plum-900 sm:text-4xl">Questions, answered gently</h2>
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
    <section className="mx-auto max-w-7xl px-4 sm:px-6">
      <motion.div
        {...fadeUp}
        className="relative overflow-hidden rounded-[2.5rem] bg-plum-900 px-6 py-16 text-center sm:px-16"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-blush-500/30 blur-3xl" />
          <div className="absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-lav-500/30 blur-3xl" />
        </div>
        <div className="relative">
          <h2 className="mx-auto max-w-2xl font-display text-3xl leading-snug text-white sm:text-4xl">
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
