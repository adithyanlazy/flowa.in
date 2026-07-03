import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HandHeart, Leaf, Sparkles } from 'lucide-react'
import PageWrap from '../components/PageWrap.jsx'
import { useAdmin } from '../context/AdminContext.jsx'

const values = [
  {
    icon: Leaf,
    title: 'Kind to skin, kind to earth',
    text: 'Chemical-free cotton, biodegradable disposal bags and plastic-free wrapping wherever we can manage it.',
  },
  {
    icon: HandHeart,
    title: 'Care over commerce',
    text: 'Pay on delivery, free shipping and a no-questions replacement policy — because trust is earned, not asked for.',
  },
  {
    icon: Sparkles,
    title: 'Joy in small things',
    text: 'A bar of chocolate, a handwritten note, soft colours. Periods are hard enough; unboxing should not be.',
  },
]

const stats = [
  { value: '50,000+', label: 'women served' },
  { value: '4.8★', label: 'average rating' },
  { value: '24h', label: 'dispatch time' },
  { value: '0', label: 'harsh chemicals' },
]

export default function About() {
  const { content } = useAdmin()
  return (
    <PageWrap>
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-lav-200/50 blur-3xl" />
          <div className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-blush-200/50 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-3xl px-6 py-20 text-center">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 14 }}
            className="mx-auto mb-8"
          >
            <img
              src="/images/about-story.jpg"
              alt="Hands wrapping a Flowa gift box with a ribbon"
              className="mx-auto aspect-square w-56 rounded-[2rem] object-cover shadow-soft"
            />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-display text-5xl leading-tight text-plum-900"
          >
            {content.aboutTitle}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-plum-800/70"
          >
            {content.aboutBody}
          </motion.p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="rounded-3xl bg-white p-6 text-center shadow-soft"
            >
              <p className="font-display text-3xl text-blush-500">{s.value}</p>
              <p className="mt-1 text-sm font-bold text-plum-800/60">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="grid grid-cols-3 gap-6">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-3xl bg-white p-8 shadow-soft"
            >
              <span className="grid h-13 w-13 place-items-center rounded-2xl bg-blush-100 p-3 text-blush-600">
                <v.icon size={24} />
              </span>
              <h2 className="mt-5 font-display text-xl text-plum-900">{v.title}</h2>
              <p className="mt-2 leading-relaxed text-plum-800/70">{v.text}</p>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Link
            to="/shop"
            className="inline-block rounded-full bg-plum-900 px-8 py-4 text-sm font-bold text-white transition-colors hover:bg-blush-600"
          >
            Shop with purpose
          </Link>
        </motion.div>
      </section>
    </PageWrap>
  )
}
