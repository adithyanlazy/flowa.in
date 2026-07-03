import { Link } from 'react-router-dom'
import { Instagram, Mail, MessageCircle, Phone } from 'lucide-react'
import { useAdmin } from '../context/AdminContext.jsx'
import LogoMark from './LogoMark.jsx'

const cols = [
  {
    title: 'Shop',
    links: [
      { label: 'All products', to: '/shop' },
      { label: 'Period kits', to: '/shop?cat=Kits' },
      { label: 'Combos', to: '/shop?cat=Combos' },
      { label: 'Gifting', to: '/shop?cat=Gifting' },
      { label: 'Essentials', to: '/shop?cat=Essentials' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Our story', to: '/about' },
      { label: 'Contact us', to: '/contact' },
      { label: 'FAQs', to: '/faq' },
      { label: 'Wishlist', to: '/wishlist' },
    ],
  },
  {
    title: 'Policies',
    links: [
      { label: 'Privacy policy', to: '/policy/privacy' },
      { label: 'Terms of service', to: '/policy/terms' },
      { label: 'Shipping policy', to: '/policy/shipping' },
      { label: 'Refund policy', to: '/policy/refund' },
    ],
  },
]

export default function Footer() {
  const { content } = useAdmin()
  return (
    <footer className="mt-24 bg-plum-900 text-blush-100">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <LogoMark className="h-9 w-9" />
              <span className="font-display text-2xl">flowa<span className="text-blush-300">.</span></span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-blush-100/70">{content.footerTagline}</p>
            <div className="mt-5 flex gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Flowa on Instagram"
                className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition-colors hover:bg-blush-500"
              >
                <Instagram size={18} />
              </a>
              <a
                href={`https://wa.me/${content.whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
                aria-label="Chat on WhatsApp"
                className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition-colors hover:bg-emerald-500"
              >
                <MessageCircle size={18} />
              </a>
              <a
                href={`mailto:${content.contactEmail}`}
                aria-label="Email Flowa"
                className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition-colors hover:bg-lav-500"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>

          {cols.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="mb-4 font-display text-sm uppercase tracking-widest text-blush-300">{col.title}</h3>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sm text-blush-100/70 transition-colors hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-blush-100/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Flowa. Made with care in India.</p>
          <div className="flex items-center gap-4">
            <a href={`tel:${content.contactPhone.replace(/\s/g, '')}`} className="flex items-center gap-1.5 transition-colors hover:text-white">
              <Phone size={13} /> {content.contactPhone}
            </a>
            <span>·</span>
            <span>COD available · Free delivery</span>
            <span>·</span>
            <Link to="/admin" className="transition-colors hover:text-white">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
