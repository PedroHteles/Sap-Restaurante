import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app/App.jsx'
import { FirebaseProvider } from '@/app/contexts/FirebaseContext/FirebaseContext'
import { AuthProvider } from '@/app/contexts/FirebaseProvider/FirebaseProvider'
import { LoadingProvider } from '@/app/contexts/LoadingProvider/LoadingProvider'
import { ModalProvider } from '@/app/contexts/ModalProvider/ModalProvider'
import { OrdersProvider } from '@/app/contexts/OrdersProvider/OrdersProvider'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LoadingProvider>
      <FirebaseProvider>
        <AuthProvider>
          <ModalProvider>
            <OrdersProvider>
              <App />
            </OrdersProvider>
          </ModalProvider>
        </AuthProvider>
      </FirebaseProvider>
    </LoadingProvider>

  </StrictMode>,
)
