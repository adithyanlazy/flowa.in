import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Banknote, CreditCard, Loader2, Lock, ShoppingBag } from 'lucide-react'
import PageWrap from '../components/PageWrap.jsx'
import ProductVisual from '../components/ProductVisual.jsx'
import { useStore } from '../context/StoreContext.jsx'
import { useAdmin } from '../context/AdminContext.jsx'
import { formatINR } from '../data/products.js'

const fields = [
  { id: 'name', label: 'Full name', type: 'text', autoComplete: 'name', span: 2, placeholder: 'Priya Sharma' },
  { id: 'phone', label: 'Phone number', type: 'tel', autoComplete: 'tel', span: 2, placeholder: '10-digit mobile number' },
  { id: 'address', label: 'Address (house, street, area)', type: 'text', autoComplete: 'street-address', span: 2, placeholder: 'Flat 2B, Rose Residency, MG Road' },
  { id: 'city', label: 'City', type: 'text', autoComplete: 'address-level2', span: 1, placeholder: 'Mangaluru' },
  { id: 'pincode', label: 'Pincode', type: 'text', autoComplete: 'postal-code', span: 1, placeholder: '575001' },
]

function validate(form) {
  const errors = {}
  if (!form.name.trim() || form.name.trim().length < 3) errors.name = 'Please enter your full name'
  if (!/^[6-9]\d{9}$/.test(form.phone.trim())) errors.phone = 'Enter a valid 10-digit Indian mobile number'
  if (form.address.trim().length < 10) errors.address = 'Please enter your complete address'
  if (!form.city.trim()) errors.city = 'City is required'
  if (!/^\d{6}$/.test(form.pincode.trim())) errors.pincode = 'Enter a valid 6-digit pincode'
  return errors
}

export default function Checkout() {
  const { cart, dispatch, setLastOrder } = useStore()
  const { getProduct } = useAdmin()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '', pincode: '', note: '' })
  const [errors, setErrors] = useState({})
  const [placing, setPlacing] = useState(false)

  const items = cart.map((i) => ({ ...i, product: getProduct(i.id) })).filter((i) => i.product)
  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0)
  const savings = items.reduce((s, i) => s + Math.max(0, i.product.mrp - i.product.price) * i.qty, 0)

  if (items.length === 0 && !placing) {
    return (
      <PageWrap className="mx-auto max-w-xl px-4 py-24 text-center">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-blush-100">
          <ShoppingBag size={32} className="text-blush-500" />
        </span>
        <h1 className="mt-6 font-display text-2xl text-plum-900">Your bag is empty</h1>
        <p className="mt-2 text-plum-800/60">Add a kit before checking out.</p>
        <Link
          to="/shop"
          className="mt-6 inline-block rounded-full bg-plum-900 px-8 py-4 text-sm font-bold text-white transition-colors hover:bg-blush-600"
        >
          Go to shop
        </Link>
      </PageWrap>
    )
  }

  const set = (id, value) => {
    setForm((f) => ({ ...f, [id]: value }))
    if (errors[id]) setErrors((e) => ({ ...e, [id]: undefined }))
  }

  const placeOrder = (e) => {
    e.preventDefault()
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length > 0) {
      document.getElementById(Object.keys(errs)[0])?.focus()
      return
    }
    setPlacing(true)
    // simulate order placement
    setTimeout(() => {
      const order = {
        id: 'FLW' + Date.now().toString().slice(-8),
        items: items.map((i) => ({ id: i.id, qty: i.qty, name: i.product.name, price: i.product.price })),
        total: subtotal,
        savings,
        customer: { ...form },
        placedAt: new Date().toISOString(),
        payment: 'Cash on Delivery',
      }
      setLastOrder(order)
      dispatch({ type: 'clear' })
      navigate('/order-success')
    }, 1400)
  }

  return (
    <PageWrap className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <h1 className="font-display text-4xl text-plum-900">Checkout</h1>
      <p className="mt-2 flex items-center gap-1.5 text-sm text-plum-800/60">
        <Lock size={13} /> Your details are used only for this delivery.
      </p>

      <form onSubmit={placeOrder} noValidate className="mt-8 grid grid-cols-1 items-start gap-8 lg:mt-10 lg:grid-cols-[1.5fr_1fr] lg:gap-10">
        {/* address */}
        <div className="space-y-8">
          <section className="rounded-3xl bg-white p-6 shadow-soft sm:p-8">
            <h2 className="font-display text-xl text-plum-900">Delivery address</h2>
            <div className="mt-6 grid grid-cols-2 gap-5">
              {fields.map((f) => (
                <div key={f.id} className={f.span === 2 ? 'col-span-2' : ''}>
                  <label htmlFor={f.id} className="mb-1.5 block text-sm font-bold text-plum-900">
                    {f.label} <span className="text-blush-500">*</span>
                  </label>
                  <input
                    id={f.id}
                    type={f.type}
                    autoComplete={f.autoComplete}
                    placeholder={f.placeholder}
                    value={form[f.id]}
                    onChange={(e) => set(f.id, e.target.value)}
                    aria-invalid={!!errors[f.id]}
                    className={`w-full rounded-2xl border-2 bg-cream px-4 py-3.5 text-plum-900 outline-none transition-colors placeholder:text-plum-800/30 focus:border-blush-400 ${
                      errors[f.id] ? 'border-red-400' : 'border-blush-100'
                    }`}
                  />
                  {errors[f.id] && (
                    <p role="alert" className="mt-1.5 text-sm font-semibold text-red-600">
                      {errors[f.id]}
                    </p>
                  )}
                </div>
              ))}
              <div className="col-span-2">
                <label htmlFor="note" className="mb-1.5 block text-sm font-bold text-plum-900">
                  Delivery note <span className="font-normal text-plum-800/50">(optional)</span>
                </label>
                <input
                  id="note"
                  type="text"
                  placeholder="e.g. call before delivery"
                  value={form.note}
                  onChange={(e) => set('note', e.target.value)}
                  className="w-full rounded-2xl border-2 border-blush-100 bg-cream px-4 py-3.5 text-plum-900 outline-none transition-colors placeholder:text-plum-800/30 focus:border-blush-400"
                />
              </div>
            </div>
          </section>

          {/* payment */}
          <section className="rounded-3xl bg-white p-6 shadow-soft sm:p-8">
            <h2 className="font-display text-xl text-plum-900">Payment method</h2>
            <div className="mt-6 space-y-3">
              <label className="flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-blush-400 bg-blush-50 p-5">
                <input type="radio" name="payment" defaultChecked className="h-5 w-5 accent-blush-500" />
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-emerald-600 shadow-soft">
                  <Banknote size={20} />
                </span>
                <span>
                  <span className="block font-bold text-plum-900">Pay on Delivery</span>
                  <span className="block text-sm text-plum-800/60">Cash or UPI when your box arrives</span>
                </span>
              </label>
              <div
                aria-disabled="true"
                className="flex items-center gap-4 rounded-2xl border-2 border-blush-100 p-5 opacity-50"
              >
                <input type="radio" name="payment" disabled className="h-5 w-5" />
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-blush-50 text-plum-800">
                  <CreditCard size={20} />
                </span>
                <span>
                  <span className="block font-bold text-plum-900">UPI / Cards</span>
                  <span className="block text-sm text-plum-800/60">Coming soon</span>
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* summary */}
        <aside className="rounded-3xl bg-white p-6 shadow-soft order-first lg:sticky lg:top-28 lg:order-none lg:p-8">
          <h2 className="font-display text-xl text-plum-900">Order summary</h2>
          <ul className="mt-5 space-y-4">
            {items.map(({ product, qty }) => (
              <li key={product.id} className="flex items-center gap-3">
                <ProductVisual product={product} className="h-14 w-14 shrink-0 rounded-xl" />
                <div className="flex-1 text-sm">
                  <p className="font-bold text-plum-900">{product.name}</p>
                  <p className="text-plum-800/60">Qty {qty}</p>
                </div>
                <span className="font-display text-plum-900">{formatINR(product.price * qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 space-y-2 border-t border-blush-100 pt-4 text-sm">
            <div className="flex justify-between text-plum-800/70">
              <span>Item total</span>
              <span>{formatINR(subtotal)}</span>
            </div>
            {savings > 0 && (
              <div className="flex justify-between font-bold text-emerald-600">
                <span>You save</span>
                <span>-{formatINR(savings)}</span>
              </div>
            )}
            <div className="flex justify-between text-plum-800/70">
              <span>Delivery</span>
              <span className="font-bold text-emerald-600">FREE</span>
            </div>
            <div className="flex justify-between border-t border-blush-100 pt-3">
              <span className="font-bold text-plum-900">To pay on delivery</span>
              <span className="font-display text-2xl text-plum-900">{formatINR(subtotal)}</span>
            </div>
          </div>
          <motion.button
            type="submit"
            disabled={placing}
            whileTap={{ scale: placing ? 1 : 0.97 }}
            className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-plum-900 py-4 text-sm font-bold text-white transition-colors duration-200 hover:bg-blush-600 disabled:cursor-wait disabled:opacity-70"
          >
            {placing ? (
              <>
                <Loader2 size={17} className="animate-spin" /> Placing your order…
              </>
            ) : (
              'Place order · Pay on Delivery'
            )}
          </motion.button>
          <p className="mt-3 text-center text-xs text-plum-800/50">
            Discreet, unbranded packaging · Ships within 24 hours
          </p>
        </aside>
      </form>
    </PageWrap>
  )
}
