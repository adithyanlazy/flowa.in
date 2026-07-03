import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { StoreProvider } from './context/StoreContext.jsx'
import { AdminProvider } from './context/AdminContext.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AdminProvider>
        <StoreProvider>
          <App />
        </StoreProvider>
      </AdminProvider>
    </BrowserRouter>
  </StrictMode>,
)
