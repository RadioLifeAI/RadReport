import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { dataService } from '../data/DataService'
import GoogleOneTap from '../components/GoogleOneTap'
import GoogleLoginButton from '../components/GoogleLoginButton'
import AuthConfigCheck from '../components/AuthConfigCheck'
import EmailVerificationNotice from '../components/EmailVerificationNotice'
import AnimatedGradient from '../components/hero/AnimatedGradient'
import HeroImageBackground from '../components/hero/HeroImageBackground'
import AnimatedBlobsLayer from '../components/hero/AnimatedBlobsLayer'
import ParticlesLayer from '../components/hero/ParticlesLayer'
import { testAuthConfig } from '../utils/test-auth'

function isValidEmail(v: string){ return /.+@.+\..+/.test(v) }

export default function Login(){
  const { login, loginWithGoogle, error: authError, user, isEmailVerified } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [attempts, setAttempts] = useState(0)
  const lockUntil = useRef<number | null>(null)
  const [showEmailVerification, setShowEmailVerification] = useState(false)

  useEffect(() => { 
    const last = localStorage.getItem('rr.lastEmail'); 
    if (last) setEmail(last) 
    
    // Testar configuração de autenticação
    testAuthConfig()
    
    // Verificar se usuário está autenticado mas email não verificado
    if (user && isEmailVerified === false) {
      setShowEmailVerification(true)
    }
  }, [user, isEmailVerified])
  useEffect(() => { 
    if (authError) setErr(authError.message) 
    
    // Verificar erros na URL (vindos do callback)
    const urlParams = new URLSearchParams(window.location.search)
    const urlError = urlParams.get('error')
    const urlMessage = urlParams.get('message')
    
    if (urlError && urlMessage) {
      let userMessage = urlMessage
      
      // Traduzir mensagens de erro específicas
      switch (urlError) {
        case 'oauth_error':
          userMessage = 'Erro no login com Google. Por favor, tente novamente.'
          break
        case 'exchange_error':
          userMessage = 'Erro ao processar autenticação. Por favor, tente novamente.'
          break
        case 'pkce_error':
          userMessage = 'Erro no processo de autenticação. Por favor, tente novamente.'
          break
        case 'network_error':
          userMessage = 'Erro de rede. Verifique sua conexão e tente novamente.'
          break
        case 'timeout_error':
          userMessage = 'Tempo limite excedido. Por favor, tente novamente.'
          break
        case 'auth_failed':
          userMessage = 'Falha na autenticação. Por favor, tente novamente.'
          break
      }
      
      setErr(userMessage)
      
      // Limpar os parâmetros da URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [authError])

  const emailError = useMemo(() => email && !isValidEmail(email) ? 'Email inválido' : null, [email])
  const disabled = Boolean(loading || !!emailError || !email || !password || (lockUntil.current && Date.now() < lockUntil.current))

  async function onSubmit(e: React.FormEvent){
    e.preventDefault(); if (disabled) return
    setErr(null); setLoading(true)
    try{
      const result = await login(email, password)
      if (result.success) {
        if (remember) localStorage.setItem('rr.lastEmail', email)
        navigate('/app')
      } else {
        setErr(result.error?.message || 'Não foi possível entrar. Verifique as credenciais.')
        const a = attempts + 1; setAttempts(a)
        if (a >= 5){ lockUntil.current = Date.now() + 30_000 }
      }
    } catch{
      setErr('Não foi possível entrar. Verifique as credenciais.')
      const a = attempts + 1; setAttempts(a)
      if (a >= 5){ lockUntil.current = Date.now() + 30_000 }
    } finally { setLoading(false) }
  }

  const variant: 'gradient'|'image'|'blobs'|'particles' = 'blobs'
  const imageSrc = '/hero.jpg' // opcional quando variant === 'image'
  const googleEnabled = dataService.googleEnabled
  const googleClientId = dataService.getGoogleClientId()

  const renderHeroBackground = () => {
    switch (variant as string) {
      case 'gradient':
        return <AnimatedGradient />
      case 'image':
        return <HeroImageBackground src={imageSrc} />
      case 'blobs':
        return <AnimatedBlobsLayer />
      case 'particles':
        return <ParticlesLayer />
      default:
        return <AnimatedBlobsLayer />
    }
  }

  return (
    <>
      <AuthConfigCheck />
      <GoogleOneTap 
        onSuccess={() => navigate('/app')}
        onError={(error) => setErr('Erro ao fazer login com Google: ' + error.message)}
      />
      <div className="relative min-h-screen overflow-hidden bg-[color:var(--bg)] text-foreground">
      {renderHeroBackground()}
      <div className="hero-horizon" />
      <div className="container relative z-10 grid min-h-screen place-items-center py-12">
        <form onSubmit={onSubmit} aria-labelledby="loginTitle" className="w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-300 rounded-2xl border border-[color:var(--divider)] bg-[color:var(--panel)]/70 p-6 shadow">
          <h2 id="loginTitle" className="m-0 text-2xl font-semibold">Bem-vindo</h2>
          <p className="mt-1 text-sm text-muted">Acesse sua conta</p>

          {/* Notificação de verificação de email */}
          {showEmailVerification && user?.email && (
            <EmailVerificationNotice 
              email={user.email} 
              onClose={() => setShowEmailVerification(false)}
            />
          )}

          {googleEnabled && googleClientId && (
          <GoogleLoginButton
            className="mt-4 w-full"
            onSuccess={() => navigate('/app')}
            onError={(error) => setErr('Erro ao fazer login com Google: ' + error.message)}
          />
          )}
          <div className="my-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <span className="h-px bg-[color:var(--divider)]" />
            <span className="text-xs text-muted">ou</span>
            <span className="h-px bg-[color:var(--divider)]" />
          </div>

          <label className="grid gap-1">
            <span className="text-sm">Email</span>
            <input aria-invalid={!!emailError} aria-describedby={emailError? 'emailHelp': undefined} value={email} onChange={e=>setEmail(e.target.value)} type="email" required className="rounded-md border border-[color:var(--divider)] bg-black/30 px-3 py-2 outline-none html:light:bg-white" />
          </label>
          {emailError && <div id="emailHelp" role="alert" className="mt-1 text-xs text-red-300">{emailError}</div>}

          <label className="mt-3 grid gap-1">
            <span className="text-sm">Senha</span>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <input value={password} onChange={e=>setPassword(e.target.value)} type={showPass? 'text':'password'} className="rounded-md border border-[color:var(--divider)] bg-black/30 px-3 py-2 outline-none html:light:bg-white" />
              <button type="button" className="rounded-md border border-[color:var(--divider)] px-3 py-2" aria-pressed={showPass} onClick={()=>setShowPass(v=>!v)}>{showPass? 'Ocultar' : 'Mostrar'}</button>
            </div>
          </label>

          <label className="mt-3 flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} />
            <span>Lembrar-me</span>
          </label>

          {err && <div role="alert" className="mt-2 text-sm text-red-300">{err}</div>}

          <button className="mt-4 w-full rounded-lg bg-primary px-4 py-2 text-black shadow-glow disabled:opacity-60" type="submit" disabled={disabled}>{loading? 'Entrando…' : 'Entrar'}</button>

          <div className="mt-3 flex justify-between text-xs text-muted">
            <Link to="/signup">Criar conta</Link>
            <a href="#">Esqueci minha senha</a>
          </div>
        </form>
      </div>
    </div>
    </>
  )
}