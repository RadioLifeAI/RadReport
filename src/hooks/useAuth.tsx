import React, { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { supabase, signUp, signIn, signInWithGoogle, signOut, getCurrentUser, updateUserProfile, startSessionMonitoring, User, AuthError } from '@/lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<AuthError | null>(null)
  const [isEmailVerified, setIsEmailVerified] = useState<boolean | null>(null)

  // Carregar usuário atual ao montar o componente
  useEffect(() => {
    loadUser()
    
    // Iniciar monitoramento de sessão (melhor prática 2025)
    const stopMonitoring = startSessionMonitoring()
    
    // Ouvir evento de sessão expirada
    const handleSessionExpired = () => {
      console.log('Sessão expirada detectada')
      setUser(null)
      setIsEmailVerified(null)
      window.location.href = '/login?error=session_expired&message=Sua sessão expirou. Por favor, faça login novamente.'
    }
    
    window.addEventListener('auth:session-expired', handleSessionExpired)
    
    // Ouvir mudanças de autenticação - CRÍTICO para OAuth funcionar
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      console.log('=== Auth State Change ===')
      console.log('Evento:', event)
      console.log('Sessão:', session)
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('✓ Usuário autenticado com sucesso')
        console.log('Detalhes do usuário:', {
          id: session.user.id,
          email: session.user.email,
          nome: session.user.user_metadata?.name
        })
        
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        setLoading(false)
        
        // NÃO redirecionar aqui - deixar os componentes específicos lidarem com isso
        console.log('Localização atual:', window.location.pathname)
        
      } else if (event === 'SIGNED_OUT') {
        console.log('✓ Usuário deslogado')
        setUser(null)
        setLoading(false)
        
      } else if (session?.user) {
        // Para outros eventos que indicam usuário autenticado
        console.log('✓ Sessão detectada, atualizando usuário...')
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        setLoading(false)
        
      } else {
        console.log('✓ Nenhuma sessão ativa')
        setUser(null)
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
      stopMonitoring()
      window.removeEventListener('auth:session-expired', handleSessionExpired)
    }
  }, [])

  const loadUser = useCallback(async () => {
    try {
      setLoading(true)
      console.log('=== Carregando usuário atual ===')
      const currentUser = await getCurrentUser()
      console.log('Usuário carregado:', currentUser)
      setUser(currentUser)
      setIsEmailVerified(currentUser?.emailConfirmed ?? null)
    } catch (err) {
      console.log('Erro ao carregar usuário:', err)
      setError({ message: 'Erro ao carregar usuário' })
    } finally {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)
      
      const result = await signIn(email, password)
      
      if (result.error) {
        setError(result.error)
        return { success: false, error: result.error }
      }
      
      if (result.user) {
        setUser(result.user)
        setIsEmailVerified(result.user.emailConfirmed ?? null)
        return { success: true, user: result.user }
      }
      
      return { success: false, error: { message: 'Erro ao fazer login' } }
    } catch (err) {
      const error = { message: 'Erro ao fazer login' }
      setError(error)
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (email: string, password: string, name?: string) => {
    try {
      setError(null)
      setLoading(true)
      
      const result = await signUp(email, password, name)
      
      if (result.error) {
        setError(result.error)
        return { success: false, error: result.error }
      }
      
      if (result.user) {
        setUser(result.user)
        setIsEmailVerified(result.user.emailConfirmed ?? null)
        return { success: true, user: result.user }
      }
      
      return { success: false, error: { message: 'Erro ao criar conta' } }
    } catch (err) {
      const error = { message: 'Erro ao criar conta' }
      setError(error)
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }, [])

  const loginWithGoogle = useCallback(async () => {
    try {
      setError(null)
      const result = await signInWithGoogle()
      
      if (result.error) {
        setError(result.error)
        return { success: false, error: result.error }
      }
      
      // Redirecionamento será tratado pelo OAuth
      return { success: true, url: result.url }
    } catch (err) {
      const error = { message: 'Erro ao fazer login com Google' }
      setError(error)
      return { success: false, error }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      setError(null)
      const result = await signOut()
      
      if (result.error) {
        setError(result.error)
        return { success: false, error: result.error }
      }
      
      setUser(null)
      return { success: true }
    } catch (err) {
      const error = { message: 'Erro ao fazer logout' }
      setError(error)
      return { success: false, error }
    }
  }, [])

  const updateProfile = useCallback(async (updates: {
    name?: string
    picture?: string
    email?: string
  }) => {
    try {
      setError(null)
      setLoading(true)
      
      const result = await updateUserProfile(updates)
      
      if (result.error) {
        setError(result.error)
        return { success: false, error: result.error }
      }
      
      if (result.user) {
        setUser(result.user)
        return { success: true, user: result.user }
      }
      
      return { success: false, error: { message: 'Erro ao atualizar perfil' } }
    } catch (err) {
      const error = { message: 'Erro ao atualizar perfil' }
      setError(error)
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }, [])

  // Log para monitorar o estado de autenticação
  console.log('=== useAuth State ===')
  console.log('user:', user)
  console.log('isAuthenticated calculado:', !!user)
  console.log('isEmailVerified:', isEmailVerified)

  return {
    user,
    loading,
    error,
    login,
    register,
    loginWithGoogle,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isEmailVerified
  }
}

// Auth Context and Provider
interface AuthContextType {
  user: User | null
  loading: boolean
  error: AuthError | null
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: AuthError }>
  register: (email: string, password: string, name?: string) => Promise<{ success: boolean; user?: User; error?: AuthError }>
  loginWithGoogle: () => Promise<{ success: boolean; url?: string; error?: AuthError }>
  logout: () => Promise<{ success: boolean; error?: AuthError }>
  updateProfile: (updates: { name?: string; picture?: string; email?: string }) => Promise<{ success: boolean; user?: User; error?: AuthError }>
  isAuthenticated: boolean
  isEmailVerified: boolean | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth()
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}