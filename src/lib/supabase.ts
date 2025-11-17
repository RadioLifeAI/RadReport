import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gxhbdbovixbptrjrcwbr.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4aGJkYm92aXhicHRyanJjd2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMzY3MzgsImV4cCI6MjA3ODcxMjczOH0.S4-5DqCkTdT4_j7ZGfwulMHwgIXG_9g1CtahY6qi50Q'

// Configuração avançada do cliente Supabase com melhores práticas 2025
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Persistir sessão em localStorage para melhor experiência
    persistSession: true,
    // Auto refresh tokens
    autoRefreshToken: true,
    // Detectar expiração de sessão
    detectSessionInUrl: true,
    // Storage key personalizado
    storageKey: 'radreport-auth-token',
    // Flow type para melhor segurança
    flowType: 'pkce'
  },
  global: {
    // Headers para melhor segurança
    headers: {
      'x-application-name': 'radreport-ai',
      'x-client-version': '1.0.0'
    }
  }
})

export interface User {
  id: string
  email: string
  name?: string
  picture?: string
  created_at?: string
  updated_at?: string
  emailConfirmed?: boolean
}

export interface AuthError {
  message: string
  status?: number
}

export async function signUp(email: string, password: string, name?: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0],
          picture: null
        }
      }
    })

    if (error) throw error

    return { 
      user: data.user ? {
        id: data.user.id,
        email: data.user.email!,
        name: data.user.user_metadata?.name,
        picture: data.user.user_metadata?.picture
      } as User : null,
      session: data.session 
    }
  } catch (error) {
    return { 
      user: null, 
      session: null,
      error: { message: (error as Error).message } as AuthError 
    }
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error

    // Verificar se o email foi confirmado (melhor prática 2025)
    if (data.user && !data.user.email_confirmed_at) {
      return { 
        user: null, 
        session: null,
        error: { 
          message: 'Por favor, confirme seu email antes de fazer login. Verifique sua caixa de entrada.',
          status: 401 
        } as AuthError 
      }
    }

    return { 
      user: data.user ? {
        id: data.user.id,
        email: data.user.email!,
        name: data.user.user_metadata?.name,
        picture: data.user.user_metadata?.picture,
        emailConfirmed: !!data.user.email_confirmed_at
      } as User : null,
      session: data.session 
    }
  } catch (error) {
    return { 
      user: null, 
      session: null,
      error: { message: (error as Error).message } as AuthError 
    }
  }
}

export async function signInWithGoogle() {
  try {
    // Detectar a URL correta baseada na porta atual
    const currentOrigin = window.location.origin
    const redirectUrl = `${currentOrigin}/auth/callback`
    
    console.log('=== Configuração Google OAuth ===')
    console.log('Origem atual:', currentOrigin)
    console.log('URL de redirect:', redirectUrl)
    console.log('Hostname:', window.location.hostname)
    console.log('Porta:', window.location.port)
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    })

    if (error) throw error
    return { url: data.url, error: null }
  } catch (error) {
    return { 
      url: null, 
      error: { message: (error as Error).message } as AuthError 
    }
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { error: null }
  } catch (error) {
    return { error: { message: (error as Error).message } as AuthError }
  }
}

export async function getCurrentUser() {
  try {
    // Tentar obter usuário com cache e retry (melhor prática 2025)
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      // Se for erro de network, tentar novamente
      if (error.message.includes('network') || error.message.includes('fetch')) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        const retry = await supabase.auth.getUser()
        if (!retry.error) return formatUser(retry.data.user)
      }
      throw error
    }
    
    return formatUser(user)
  } catch (error) {
    console.error('Erro ao obter usuário atual:', error)
    return null
  }
}

// Função auxiliar para formatar usuário
function formatUser(user: any): User | null {
  if (!user) return null
  
  return {
    id: user.id,
    email: user.email!,
    name: user.user_metadata?.name,
    picture: user.user_metadata?.picture,
    created_at: user.created_at,
    updated_at: user.updated_at,
    emailConfirmed: !!user.email_confirmed_at
  } as User
}

export async function updateUserProfile(updates: {
  name?: string
  picture?: string
  email?: string
}) {
  try {
    const { data, error } = await supabase.auth.updateUser({
      data: updates
    })

    if (error) throw error

    return { 
      user: data.user ? {
        id: data.user.id,
        email: data.user.email!,
        name: data.user.user_metadata?.name,
        picture: data.user.user_metadata?.picture
      } as User : null,
      error: null 
    }
  } catch (error) {
    return { 
      user: null, 
      error: { message: (error as Error).message } as AuthError 
    }
  }
}

// Função para verificar e refresh tokens automaticamente
export async function checkAndRefreshSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Erro ao obter sessão:', error)
      return { session: null, error }
    }
    
    if (!session) {
      return { session: null, error: null }
    }
    
    // Verificar se o token está prestes a expirar (em 5 minutos)
    const expiresAt = session.expires_at ? session.expires_at * 1000 : 0
    const now = Date.now()
    const fiveMinutes = 5 * 60 * 1000
    
    if (expiresAt - now < fiveMinutes) {
      console.log('Token prestes a expirar, refresh automático...')
      const { data, error: refreshError } = await supabase.auth.refreshSession()
      
      if (refreshError) {
        console.error('Erro ao refresh token:', refreshError)
        return { session: null, error: refreshError }
      }
      
      return { session: data.session, error: null }
    }
    
    return { session, error: null }
  } catch (error) {
    console.error('Erro crítico ao verificar sessão:', error)
    return { session: null, error }
  }
}

// Monitorar sessão a cada 30 segundos
export function startSessionMonitoring() {
  const interval = setInterval(async () => {
    const { session, error } = await checkAndRefreshSession()
    
    if (error || !session) {
      console.log('Sessão inválida ou expirada')
      clearInterval(interval)
      // Emitir evento para a aplicação saber que a sessão expirou
      window.dispatchEvent(new CustomEvent('auth:session-expired'))
    }
  }, 30000) // 30 segundos
  
  return () => clearInterval(interval)
}

export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback)
}