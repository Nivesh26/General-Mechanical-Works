import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ChatProvider } from './context/ChatContext'
import { GoogleAuthProvider } from './providers/GoogleAuthProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleAuthProvider>
      <AuthProvider>
        <CartProvider>
          <ChatProvider>
            <App />
          </ChatProvider>
        </CartProvider>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      </AuthProvider>
    </GoogleAuthProvider>
  </StrictMode>,
)
