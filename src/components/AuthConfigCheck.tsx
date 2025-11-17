import { useEffect } from 'react'

interface AuthConfigCheckProps {
  onConfigCheck?: (config: any) => void
}

export default function AuthConfigCheck({ onConfigCheck }: AuthConfigCheckProps) {
  useEffect(() => {
    const checkConfig = () => {
      const config = {
        origin: window.location.origin,
        hostname: window.location.hostname,
        port: window.location.port,
        protocol: window.location.protocol,
        callbackUrl: `${window.location.origin}/auth/callback`,
        isLocal: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
        envVars: {
          supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
          googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        }
      }
      
      console.log('=== Verificação de Configuração de Auth ===')
      console.log('Origem:', config.origin)
      console.log('Hostname:', config.hostname)
      console.log('Porta:', config.port)
      console.log('Protocolo:', config.protocol)
      console.log('URL de Callback:', config.callbackUrl)
      console.log('É desenvolvimento local?', config.isLocal)
      console.log('Variáveis de ambiente:', config.envVars)
      console.log('==========================================')
      
      // Verificar se está tudo configurado corretamente
      if (config.isLocal) {
        console.log('✅ Modo de desenvolvimento local detectado')
        console.log('✅ URL de callback deve ser: http://localhost:5173/auth/callback')
      } else {
        console.log('⚠️  Modo de produção detectado')
        console.log(`⚠️  URL de callback deve ser: ${config.origin}/auth/callback`)
      }
      
      if (!config.envVars.supabaseUrl) {
        console.error('❌ VITE_SUPABASE_URL não configurado')
      }
      
      if (!config.envVars.googleClientId) {
        console.error('❌ VITE_GOOGLE_CLIENT_ID não configurado')
      }
      
      onConfigCheck?.(config)
    }
    
    checkConfig()
  }, [onConfigCheck])
  
  return null
}