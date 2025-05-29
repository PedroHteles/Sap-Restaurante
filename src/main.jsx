import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app/App.jsx'
import { FirebaseProvider } from '@/app/contexts/FirebaseContext/FirebaseContext'
import { AuthProvider } from '@/app/contexts/FirebaseProvider/FirebaseProvider'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FirebaseProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </FirebaseProvider>
  </StrictMode>,
)
