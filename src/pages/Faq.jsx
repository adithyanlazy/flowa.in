import { MessageCircle } from 'lucide-react'
import PageWrap from '../components/PageWrap.jsx'
import Accordion from '../components/Accordion.jsx'
import SceneArt from '../components/SceneArt.jsx'
import { useAdmin } from '../context/AdminContext.jsx'

export default function Faq() {
  const { faqs, content } = useAdmin()
  return (
    <PageWrap className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <div className="mb-10 text-center">
        <SceneArt name="help" className="mx-auto mb-6 aspect-square w-36 rounded-[2rem] shadow-soft" />
        <p className="text-sm font-bold uppercase tracking-widest text-blush-500">Help centre</p>
        <h1 className="mt-2 font-display text-3xl text-plum-900 sm:text-4xl">Frequently asked questions</h1>
      </div>
      <Accordion items={faqs} />
      <div className="mt-12 rounded-3xl bg-white p-8 text-center shadow-soft">
        <h2 className="font-display text-xl text-plum-900">Still curious about something?</h2>
        <p className="mt-2 text-plum-800/70">We reply on WhatsApp within a few hours, every day.</p>
        <a
          href={`https://wa.me/${content.whatsappNumber}`}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-plum-900 px-7 py-3.5 text-sm font-bold text-white transition-colors hover:bg-blush-600"
        >
          <MessageCircle size={16} /> Chat with us
        </a>
      </div>
    </PageWrap>
  )
}
