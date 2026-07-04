import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { useAdmin } from '../context/AdminContext.jsx'

export default function WhatsAppButton() {
  const { content } = useAdmin()
  return (
    <motion.a
      href={`https://wa.me/${content.whatsappNumber}?text=Hi%20Flowa!%20I%20have%20a%20question.`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.2, type: 'spring', damping: 15 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      className="fixed bottom-4 right-4 z-40 grid h-12 w-12 place-items-center rounded-full bg-emerald-500 text-white shadow-lift sm:bottom-6 sm:right-6 sm:h-14 sm:w-14"
    >
      <MessageCircle size={22} />
    </motion.a>
  )
}
