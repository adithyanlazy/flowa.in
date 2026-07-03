import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../context/StoreContext.jsx'

export default function Toast() {
  const { toast } = useStore()
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ y: 24, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 12, opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            className="rounded-full bg-plum-900 px-6 py-3 text-sm font-bold text-blush-100 shadow-lift"
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
