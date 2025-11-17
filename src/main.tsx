import React from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import { AuthProvider } from './hooks/useAuth'
import RoutesRoot from './routes'
import './styles.css'

const root = createRoot(document.getElementById('root')!)
root.render(
  <AuthProvider>
    <RoutesRoot />
    <Toaster 
      position="top-right"
      expand={false}
      richColors
      closeButton
      duration={4000}
    />
  </AuthProvider>
)