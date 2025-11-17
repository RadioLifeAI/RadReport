import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

// Função para gerar nonce seguro
async function generateNonce(): Promise<string[]> {
  const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))))
  const encoder = new TextEncoder()
  const encodedNonce = encoder.encode(nonce)
  const hashBuffer = await crypto.subtle.digest('SHA-256', encodedNonce)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashedNonce = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  return [nonce, hashedNonce]
}

// Tipo para o objeto global do Google
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void
          prompt: (callback?: (notification: any) => void, options?: any) => void
        }
      }
    }
  }
}

interface GoogleOneTapProps {
  onSuccess?: () => void
  onError?: (error: any) => void
}

export default function GoogleOneTap({ onSuccess, onError }: GoogleOneTapProps) {
  useEffect(() => {
    const initializeGoogleOneTap = async () => {
      try {
        // Verificar se já existe sessão
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          // Já autenticado, chamar callback de sucesso
          onSuccess?.()
          return
        }

        // Verificar configuração para desenvolvimento local
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
        
        console.log('=== Google One Tap Config ===')
        console.log('Ambiente:', isLocal ? 'Desenvolvimento Local' : 'Produção')
        console.log('Google Client ID:', googleClientId ? 'Configurado' : 'Não configurado')
        console.log('Origem:', window.location.origin)
        
        if (!googleClientId) {
          console.error('Google Client ID não configurado')
          return
        }

        // Gerar nonce para segurança
        const [nonce, hashedNonce] = await generateNonce()

        // Carregar script do Google se ainda não estiver carregado
        if (!window.google) {
          const script = document.createElement('script')
          script.src = 'https://accounts.google.com/gsi/client'
          script.async = true
          script.defer = true
          
          await new Promise<void>((resolve, reject) => {
            script.onload = () => resolve()
            script.onerror = () => reject(new Error('Failed to load Google script'))
            document.head.appendChild(script)
          })
        }

        // Configurar Google One Tap com melhores práticas 2025
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: any) => {
            try {
              console.log('Google One Tap callback recebido')
              
              // Autenticar com Supabase usando o token do Google
              const { data, error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: response.credential,
                nonce: nonce, // Usar nonce não hasheado para Supabase
              })

              if (error) {
                console.error('Erro no signInWithIdToken:', error)
                
                // Fallback: tentar login tradicional com OAuth
                if (error.message.includes('IdToken') || error.message.includes('nonce')) {
                  console.log('Tentando fallback com OAuth flow...')
                  const { data: oauthData, error: oauthError } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                      redirectTo: `${window.location.origin}/auth/callback`,
                      queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                      }
                    }
                  })
                  
                  if (oauthError) throw oauthError
                  if (oauthData.url) {
                    window.location.href = oauthData.url
                    return
                  }
                }
                
                throw error
              }

              console.log('Google One Tap login successful')
              onSuccess?.()
            } catch (error) {
              console.error('Google One Tap login error:', error)
              onError?.(error)
            }
          },
          nonce: hashedNonce, // Usar nonce hasheado para Google
          // Usar FedCM para compatibilidade com eliminação de cookies de terceiros
          use_fedcm_for_prompt: true,
          // Configurações adicionais de segurança
          context: 'signin',
          auto_select: true,
          itp_support: true,
          // Melhorias de UX 2025
          cancel_on_tap_outside: false,
          login_uri: window.location.origin,
          // Suporte para múltiplos idiomas
          locale: navigator.language || 'pt-BR'
        })

        // Mostrar o prompt do One Tap
        window.google.accounts.id.prompt((notification: any) => {
          console.log('Google One Tap prompt notification:', notification)
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log('Google One Tap not displayed or skipped')
          }
        })

      } catch (error) {
        console.error('Failed to initialize Google One Tap:', error)
        onError?.(error)
      }
    }

    // Inicializar após um pequeno delay para garantir que tudo esteja carregado
    const timer = setTimeout(initializeGoogleOneTap, 1000)

    return () => {
      clearTimeout(timer)
      // Limpar o prompt se o componente for desmontado
      if (window.google?.accounts?.id) {
        try {
          // Não há método direto para cancelar, mas podemos tentar limpar
          console.log('Cleaning up Google One Tap')
        } catch (e) {
          // Ignorar erros de limpeza
        }
      }
    }
  }, [onSuccess, onError])

  return null // Este componente não renderiza nada visível
}