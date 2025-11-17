import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [message, setMessage] = useState('Processando autenticação...')

  useEffect(() => {
    const processCallback = async () => {
      console.log('=== AuthCallback: Iniciando processamento OAuth ===')
      console.log('Current URL completa:', window.location.href)
      console.log('Search params:', window.location.search)
      
      // Verificar se há erros na URL
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const error_param = urlParams.get('error')
      const error_description = urlParams.get('error_description')
      
      console.log('Parâmetros detectados:', { code: !!code, error_param, error_description })
      
      if (error_param) {
        console.error('AuthCallback: Erro detectado na URL:', error_param, error_description)
        setStatus('error')
        setMessage('Erro na autenticação com Google')
        const errorMessage = encodeURIComponent(error_description || error_param)
        setTimeout(() => {
          navigate(`/login?error=oauth_error&message=${errorMessage}`, { replace: true })
        }, 2000)
        return
      }
      
      // Verificar se já existe uma sessão ativa
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Sessão atual:', session ? 'ATIVA' : 'NENHUMA')
      
      if (session) {
        console.log('✓ Sessão já existe, redirecionando para app...')
        setStatus('success')
        setMessage('Login realizado com sucesso!')
        setTimeout(() => {
          navigate('/app', { replace: true })
        }, 1000)
        return
      }
      
      // Se houver código, tentar processar manualmente
      if (code) {
        console.log('AuthCallback: Processando código OAuth manualmente...')
        setMessage('Verificando credenciais...')
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          console.log('Resultado exchangeCodeForSession:', { success: !error, error })
          
          if (error) {
            console.error('Erro ao trocar código:', error)
            setStatus('error')
            setMessage('Erro ao processar login')
            setTimeout(() => {
              navigate(`/login?error=exchange_error&message=${encodeURIComponent(error.message)}`, { replace: true })
            }, 2000)
            return
          }
          
          if (data.session) {
            console.log('✓ Sessão criada com sucesso!')
            setStatus('success')
            setMessage('Login realizado com sucesso!')
            // Aguardar um momento para o auth state handler processar
            setTimeout(() => {
              console.log('🔄 Navegando para /app via React Router...')
              navigate('/app', { replace: true })
            }, 1000)
            return
          }
        } catch (error: any) {
          console.error('Erro crítico no processamento:', error)
          setStatus('error')
          setMessage('Erro ao processar login')
          setTimeout(() => {
            navigate(`/login?error=processing_error&message=${encodeURIComponent(error.message)}`, { replace: true })
          }, 2000)
          return
        }
      }
      
      console.log('AuthCallback: Aguardando auth state handler processar...')
      
      // Timeout de segurança - se nada acontecer em 10 segundos, redirecionar
      const timeout = setTimeout(() => {
        console.log('AuthCallback: Timeout - verificando sessão final...')
        supabase.auth.getSession().then(({ data }) => {
          if (data.session) {
            console.log('✓ Sessão encontrada no timeout, redirecionando...')
            setStatus('success')
            setMessage('Login realizado com sucesso!')
            navigate('/app', { replace: true })
          } else {
            console.log('✗ Nenhuma sessão encontrada, redirecionando para login...')
            setStatus('error')
            setMessage('Falha ao realizar login')
            navigate('/login?error=timeout&message=Tempo limite excedido', { replace: true })
          }
        })
      }, 10000)
      
      return () => clearTimeout(timeout)
    }
    
    processCallback()
  }, [navigate])

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return (
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )
      case 'error':
        return (
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )
      default:
        return <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'text-green-600'
      case 'error': return 'text-red-600'
      default: return 'text-muted'
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[color:var(--bg)] text-foreground">
      <div className="text-center max-w-md mx-auto p-6">
        {getStatusIcon()}
        <p className={`text-lg font-medium mb-2 ${getStatusColor()}`}>{message}</p>
        <p className="text-sm text-muted">
          {status === 'processing' && 'Aguarde, estamos verificando suas credenciais com o Google...'}
          {status === 'success' && 'Redirecionando para o dashboard...'}
          {status === 'error' && 'Você será redirecionado em breve...'}
        </p>
      </div>
    </div>
  )
}