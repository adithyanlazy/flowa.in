import { useParams, Link } from 'react-router-dom'
import PageWrap from '../components/PageWrap.jsx'

const policies = {
  privacy: {
    title: 'Privacy Policy',
    sections: [
      ['What we collect', 'We collect only what is needed to deliver your order: your name, phone number and delivery address. We never sell or share your data with third parties for marketing.'],
      ['How we use it', 'Your details are used to process orders, send delivery updates over WhatsApp/SMS, and respond to support requests. Nothing else.'],
      ['Data storage', 'Order details are stored securely and deleted upon verified request. Cart and wishlist data live only in your browser.'],
      ['Your rights', 'You may request a copy or deletion of your data anytime by writing to hello@flowa.in.'],
    ],
  },
  terms: {
    title: 'Terms of Service',
    sections: [
      ['Using Flowa', 'By placing an order you confirm the delivery details provided are accurate and that you are authorised to receive deliveries at that address.'],
      ['Pricing', 'All prices are in INR, inclusive of taxes. Discounts shown against MRP reflect our standing offer prices.'],
      ['Order acceptance', 'We may cancel orders in case of address errors, repeated COD refusals, or suspected misuse. You will always be informed.'],
      ['Liability', 'Our products are personal-care items, not medical devices. For severe or unusual period pain, please consult a doctor.'],
    ],
  },
  shipping: {
    title: 'Shipping Policy',
    sections: [
      ['Dispatch', 'Orders are packed discreetly and dispatched within 24 hours, Monday to Saturday.'],
      ['Delivery time', 'Metro cities: 2–4 working days. Rest of India: 4–7 working days. Timelines may extend during sales or severe weather.'],
      ['Charges', 'Delivery is free on every order — no minimums, no hidden fees.'],
      ['Tracking', 'You receive tracking updates over WhatsApp and SMS from dispatch to doorstep.'],
    ],
  },
  refund: {
    title: 'Refund Policy',
    sections: [
      ['Hygiene first', 'Because these are personal hygiene products, opened items cannot be returned.'],
      ['Damaged or wrong items', 'If your order arrives damaged, tampered or incorrect, message us within 48 hours with a photo — we ship a free replacement, no questions asked.'],
      ['COD refusals', 'You may refuse a COD order at the door before payment. Repeated refusals may limit COD availability for your address.'],
      ['Refund timelines', 'Where a refund applies (e.g. prepaid pre-orders in future), it is processed within 5–7 working days.'],
    ],
  },
}

export default function Policy() {
  const { type } = useParams()
  const policy = policies[type]

  if (!policy) {
    return (
      <PageWrap className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl text-plum-900">Policy not found</h1>
        <Link to="/" className="mt-4 inline-block font-bold text-blush-600 hover:underline">Back home</Link>
      </PageWrap>
    )
  }

  return (
    <PageWrap className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <p className="text-sm font-bold uppercase tracking-widest text-blush-500">Flowa policies</p>
      <h1 className="mt-2 font-display text-3xl text-plum-900 sm:text-4xl">{policy.title}</h1>
      <div className="mt-10 space-y-6">
        {policy.sections.map(([heading, body]) => (
          <section key={heading} className="rounded-3xl bg-white p-7 shadow-soft">
            <h2 className="font-display text-lg text-plum-900">{heading}</h2>
            <p className="mt-2 leading-relaxed text-plum-800/70">{body}</p>
          </section>
        ))}
      </div>
    </PageWrap>
  )
}
