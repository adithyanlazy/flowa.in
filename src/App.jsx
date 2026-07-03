import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import DesktopClone from './components/DesktopClone.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import SearchModal from './components/SearchModal.jsx'
import Toast from './components/Toast.jsx'
import WhatsAppButton from './components/WhatsAppButton.jsx'
import Home from './pages/Home.jsx'
import Shop from './pages/Shop.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Wishlist from './pages/Wishlist.jsx'
import Checkout from './pages/Checkout.jsx'
import OrderSuccess from './pages/OrderSuccess.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import Faq from './pages/Faq.jsx'
import Policy from './pages/Policy.jsx'
import Admin from './pages/Admin.jsx'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => window.scrollTo({ top: 0, behavior: 'instant' }), [pathname])
  return null
}

export default function App() {
  const location = useLocation()
  const isAdmin = location.pathname === '/admin'
  const isProductDetail = location.pathname.startsWith('/product/')
  const useDefaultLayout = isAdmin || isProductDetail

  const routes = (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/policy/:type" element={<Policy />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </AnimatePresence>
  )

  return (
    <div className="flex min-h-dvh flex-col">
      <ScrollToTop />
      {/* Admin and the product detail page keep the regular responsive
          nav/footer/layout (own layout, not part of the desktop-clone
          customer site) — everything else renders at desktop breakpoints
          and is scaled down to fit narrow viewports. */}
      <DesktopClone disabled={useDefaultLayout} width={760}>
        <div className="flex min-h-dvh flex-col">
          <Navbar desktopOnly={!useDefaultLayout} />
          <main className="flex-1">{routes}</main>
          <Footer desktopOnly={!useDefaultLayout} />
        </div>
      </DesktopClone>
      <CartDrawer />
      <SearchModal />
      <Toast />
      <WhatsAppButton />
    </div>
  )
}
