import { AnimatePresence, motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import ProductVisual from './ProductVisual.jsx'
import { useStore } from '../context/StoreContext.jsx'
import { useAdmin } from '../context/AdminContext.jsx'
import { formatINR } from '../data/products.js'

export default function CartDrawer() {
  const { cart, dispatch, cartOpen, setCartOpen } = useStore()
  const { getProduct } = useAdmin()
  const navigate = useNavigate()

  const items = cart.map((i) => ({ ...i, product: i.kit || getProduct(i.id) })).filter((i) => i.product)
  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0)
  const savings = items.reduce((s, i) => s + Math.max(0, i.product.mrp - i.product.price) * i.qty, 0)

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 z-50 bg-plum-900/50 backdrop-blur-sm"
            aria-hidden="true"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="fixed right-0 top-0 z-50 flex h-dvh w-full max-w-md flex-col bg-cream shadow-lift"
            role="dialog"
            aria-label="Shopping cart"
          >
            <div className="flex items-center justify-between border-b border-blush-100 px-6 py-4">
              <h2 className="font-display text-xl text-plum-900">Your bag</h2>
              <button
                onClick={() => setCartOpen(false)}
                aria-label="Close cart"
                className="grid h-10 w-10 cursor-pointer place-items-center rounded-full text-plum-800 transition-colors hover:bg-blush-100"
              >
                <X size={20} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <span className="grid h-20 w-20 place-items-center rounded-full bg-blush-100">
                  <ShoppingBag size={32} className="text-blush-500" />
                </span>
                <p className="font-display text-lg text-plum-900">Your bag is empty</p>
                <p className="text-sm text-plum-800/60">Kind care for hard days is one tap away.</p>
                <button
                  onClick={() => {
                    setCartOpen(false)
                    navigate('/shop')
                  }}
                  className="cursor-pointer rounded-full bg-plum-900 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-blush-600"
                >
                  Browse kits
                </button>
              </div>
            ) : (
              <>
                <ul className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
                  {items.map(({ product, qty, kit }) => (
                    <motion.li
                      key={product.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 40 }}
                      className="flex gap-4 rounded-2xl bg-white p-3 shadow-soft"
                    >
                      {kit ? (
                        <ProductVisual product={product} className="h-20 w-20 shrink-0 rounded-xl" />
                      ) : (
                        <Link to={`/product/${product.id}`} onClick={() => setCartOpen(false)}>
                          <ProductVisual product={product} className="h-20 w-20 shrink-0 rounded-xl" />
                        </Link>
                      )}
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          {kit ? (
                            <span className="font-display text-sm leading-tight text-plum-900">{product.name}</span>
                          ) : (
                            <Link
                              to={`/product/${product.id}`}
                              onClick={() => setCartOpen(false)}
                              className="font-display text-sm leading-tight text-plum-900 hover:text-blush-600"
                            >
                              {product.name}
                            </Link>
                          )}
                          <button
                            onClick={() => dispatch({ type: 'remove', id: product.id })}
                            aria-label={`Remove ${product.name}`}
                            className="cursor-pointer text-plum-800/40 transition-colors hover:text-blush-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        {kit && (
                          <p className="mt-0.5 line-clamp-2 text-xs text-plum-800/50">{product.contents.join(', ')}</p>
                        )}
                        <div className="mt-auto flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2 rounded-full bg-blush-50 px-1 py-1">
                            <button
                              onClick={() => dispatch({ type: 'setQty', id: product.id, qty: qty - 1 })}
                              aria-label="Decrease quantity"
                              className="grid h-7 w-7 cursor-pointer place-items-center rounded-full bg-white text-plum-800 shadow-sm transition-transform hover:scale-105"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="w-5 text-center text-sm font-bold text-plum-900">{qty}</span>
                            <button
                              onClick={() => dispatch({ type: 'setQty', id: product.id, qty: qty + 1 })}
                              aria-label="Increase quantity"
                              className="grid h-7 w-7 cursor-pointer place-items-center rounded-full bg-white text-plum-800 shadow-sm transition-transform hover:scale-105"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                          <span className="font-display text-plum-900">{formatINR(product.price * qty)}</span>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>

                <div className="space-y-3 border-t border-blush-100 bg-white px-6 py-5">
                  {savings > 0 && (
                    <p className="rounded-xl bg-emerald-50 px-4 py-2 text-center text-sm font-bold text-emerald-700">
                      You're saving {formatINR(savings)} on this order 🎀
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm text-plum-800/70">
                    <span>Delivery</span>
                    <span className="font-bold text-emerald-600">FREE</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-plum-900">Subtotal</span>
                    <span className="font-display text-xl text-plum-900">{formatINR(subtotal)}</span>
                  </div>
                  <button
                    onClick={() => {
                      setCartOpen(false)
                      navigate('/checkout')
                    }}
                    className="w-full cursor-pointer rounded-full bg-plum-900 py-4 text-sm font-bold text-white transition-colors duration-200 hover:bg-blush-600"
                  >
                    Checkout · Pay on Delivery
                  </button>
                  <p className="text-center text-xs text-plum-800/50">Discreet packaging · No delivery charges · COD</p>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
