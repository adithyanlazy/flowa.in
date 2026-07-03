import { Link } from 'react-router-dom'
import PageWrap from '../components/PageWrap.jsx'
import ProductCard from '../components/ProductCard.jsx'
import SceneArt from '../components/SceneArt.jsx'
import { useStore } from '../context/StoreContext.jsx'
import { useAdmin } from '../context/AdminContext.jsx'

export default function Wishlist() {
  const { wishlist } = useStore()
  const { products } = useAdmin()
  const list = products.filter((p) => wishlist.includes(p.id))

  return (
    <PageWrap className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-10">
        <p className="text-sm font-bold uppercase tracking-widest text-blush-500">Saved with love</p>
        <h1 className="mt-2 font-display text-4xl text-plum-900">Your wishlist</h1>
      </div>

      {list.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-white py-20 text-center shadow-soft">
          <SceneArt name="empty" className="aspect-square w-32 rounded-3xl" />
          <p className="font-display text-lg text-plum-900">Nothing saved yet</p>
          <p className="max-w-xs text-sm text-plum-800/60">
            Tap the heart on any product to keep it here for later.
          </p>
          <Link
            to="/shop"
            className="mt-2 rounded-full bg-plum-900 px-7 py-3 text-sm font-bold text-white transition-colors hover:bg-blush-600"
          >
            Explore the shop
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-6">
          {list.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </PageWrap>
  )
}
