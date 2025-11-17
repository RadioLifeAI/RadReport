import React from 'react'
import { createBrowserRouter, RouterProvider, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Signup from './pages/SignUp'
import AuthCallback from './pages/AuthCallback'
import EditorApp from './App'
import { useAuth } from './hooks/useAuth'

// Componente que gerencia as rotas com autenticação
function AppRoutes() {
  const { isAuthenticated } = useAuth()
  
  console.log('=== AppRoutes Component ===')
  console.log('isAuthenticated:', isAuthenticated)
  console.log('Current path:', window.location.pathname)

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route 
        path="/app" 
        element={isAuthenticated ? <EditorApp /> : <Navigate to="/login" replace />} 
      />
    </Routes>
  )
}

const router = createBrowserRouter([
  { path: '/*', element: <AppRoutes /> }
])

export default function RoutesRoot(){
  return <RouterProvider router={router} />
}