import { useState } from 'react'
import { Instagram, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react'
import PageWrap from '../components/PageWrap.jsx'
import { useStore } from '../context/StoreContext.jsx'
import { useAdmin } from '../context/AdminContext.jsx'

export default function Contact() {
  const { showToast } = useStore()
  const { content } = useAdmin()
  const channels = [
    { icon: Phone, label: 'Call us', value: content.contactPhone, href: `tel:${content.contactPhone.replace(/\s/g, '')}` },
    { icon: MessageCircle, label: 'WhatsApp', value: 'Chat with the team', href: `https://wa.me/${content.whatsappNumber}` },
    { icon: Mail, label: 'Email', value: content.contactEmail, href: `mailto:${content.contactEmail}` },
    { icon: Instagram, label: 'Instagram', value: '@flowa.in', href: 'https://instagram.com' },
  ]
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState({})

  const submit = (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.name.trim()) errs.name = 'Please tell us your name'
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errs.email = 'Enter a valid email address'
    if (form.message.trim().length < 10) errs.message = 'Message should be at least 10 characters'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setForm({ name: '', email: '', message: '' })
    showToast("Message sent! We'll reply within 24 hours 💌")
  }

  return (
    <PageWrap className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-12 max-w-xl">
        <p className="text-sm font-bold uppercase tracking-widest text-blush-500">We're listening</p>
        <h1 className="mt-2 font-display text-4xl text-plum-900">Talk to us about anything</h1>
        <p className="mt-3 text-plum-800/70">
          Order help, product questions, or ideas to make Flowa better — every message is read by a real human on our
          team.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.3fr] lg:gap-10">
        <div className="space-y-4">
          <img
            src="/images/contact.jpg"
            alt="Cozy flat lay with phone, tea and dried flowers"
            className="aspect-[4/3] w-full rounded-3xl object-cover shadow-soft"
          />
          {channels.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target={c.href.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer"
              className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-soft transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lift"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-blush-100 text-blush-600">
                <c.icon size={22} />
              </span>
              <span>
                <span className="block text-sm font-bold text-plum-800/50">{c.label}</span>
                <span className="block font-bold text-plum-900">{c.value}</span>
              </span>
            </a>
          ))}
          <div className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-soft">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-lav-100 text-lav-600">
              <MapPin size={22} />
            </span>
            <span>
              <span className="block text-sm font-bold text-plum-800/50">Based in</span>
              <span className="block font-bold text-plum-900">Mangaluru, Karnataka</span>
            </span>
          </div>
        </div>

        <form onSubmit={submit} noValidate className="rounded-3xl bg-white p-6 sm:p-8 shadow-soft">
          <div className="space-y-5">
            <div>
              <label htmlFor="c-name" className="mb-1.5 block text-sm font-bold text-plum-900">
                Your name <span className="text-blush-500">*</span>
              </label>
              <input
                id="c-name"
                type="text"
                value={form.name}
                autoComplete="name"
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className={`w-full rounded-2xl border-2 bg-cream px-4 py-3.5 text-plum-900 outline-none transition-colors focus:border-blush-400 ${errors.name ? 'border-red-400' : 'border-blush-100'}`}
              />
              {errors.name && <p role="alert" className="mt-1.5 text-sm font-semibold text-red-600">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="c-email" className="mb-1.5 block text-sm font-bold text-plum-900">
                Email <span className="text-blush-500">*</span>
              </label>
              <input
                id="c-email"
                type="email"
                value={form.email}
                autoComplete="email"
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className={`w-full rounded-2xl border-2 bg-cream px-4 py-3.5 text-plum-900 outline-none transition-colors focus:border-blush-400 ${errors.email ? 'border-red-400' : 'border-blush-100'}`}
              />
              {errors.email && <p role="alert" className="mt-1.5 text-sm font-semibold text-red-600">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="c-message" className="mb-1.5 block text-sm font-bold text-plum-900">
                Message <span className="text-blush-500">*</span>
              </label>
              <textarea
                id="c-message"
                rows={5}
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                className={`w-full resize-none rounded-2xl border-2 bg-cream px-4 py-3.5 text-plum-900 outline-none transition-colors focus:border-blush-400 ${errors.message ? 'border-red-400' : 'border-blush-100'}`}
              />
              {errors.message && <p role="alert" className="mt-1.5 text-sm font-semibold text-red-600">{errors.message}</p>}
            </div>
            <button
              type="submit"
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-plum-900 px-8 py-4 text-sm font-bold text-white transition-colors duration-200 hover:bg-blush-600"
            >
              <Send size={16} /> Send message
            </button>
          </div>
        </form>
      </div>
    </PageWrap>
  )
}
