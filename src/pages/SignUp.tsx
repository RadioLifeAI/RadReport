import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import AnimatedGradient from '../components/hero/AnimatedGradient'
import HeroImageBackground from '../components/hero/HeroImageBackground'
import AnimatedBlobsLayer from '../components/hero/AnimatedBlobsLayer'
import ParticlesLayer from '../components/hero/ParticlesLayer'
import TurnstileWidget from '../components/TurnstileWidget'

function isValidEmail(v: string){ return /.+@.+\..+/.test(v) }

export default function Signup(){
  const { register, error: authError } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [turnstileError, setTurnstileError] = useState<string | null>(null)

  useEffect(() => { if (authError) setErr(authError.message) }, [authError])

  const emailError = useMemo(() => email && !isValidEmail(email) ? 'Email inválido' : null, [email])
  const passwordError = useMemo(() => password && password.length < 6 ? 'Mínimo 6 caracteres' : null, [password])
  const confirmPasswordError = useMemo(() => confirmPassword && password !== confirmPassword ? 'As senhas não coincidem' : null, [confirmPassword, password])
  
  const disabled = loading || !!emailError || !!passwordError || !!confirmPasswordError || !name || !email || !password || !confirmPassword || !turnstileToken

  async function onSubmit(e: React.FormEvent){
    e.preventDefault(); if (disabled) return
    setErr(null); setLoading(true)
    
    try {
      // Verificar Turnstile token
      if (!turnstileToken) {
        setErr('Por favor, complete a verificação de segurança.')
        setLoading(false)
        return
      }
      
      // Validar Turnstile no servidor
      const response = await fetch('/api/turnstile/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: turnstileToken })
      })
      
      const result = await response.json()
      
      if (!result.success) {
        setErr('Falha na verificação de segurança. Por favor, tente novamente.')
        setLoading(false)
        return
      }
      
      // Prosseguir com o registro
      const registerResult = await register(email, password, name)
      if (registerResult.success) {
        navigate('/app')
      } else {
        setErr(registerResult.error?.message || 'Não foi possível criar a conta.')
      }
    } catch {
      setErr('Não foi possível criar a conta.')
    } finally { 
      setLoading(false) 
    }
  }

  const variant: 'gradient'|'image'|'blobs'|'particles' = 'blobs'

  const renderHeroBackground = () => {
    switch (variant as string) {
      case 'gradient':
        return <AnimatedGradient />
      case 'image':
        return <HeroImageBackground src="/hero.jpg" />
      case 'blobs':
        return <AnimatedBlobsLayer />
      case 'particles':
        return <ParticlesLayer />
      default:
        return <AnimatedBlobsLayer />
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[color:var(--bg)] text-foreground">
      {renderHeroBackground()}
      <div className="hero-horizon" />
      <div className="container relative z-10 grid min-h-screen place-items-center py-12">
        <form onSubmit={onSubmit} aria-labelledby="signupTitle" className="w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-300 rounded-2xl border border-[color:var(--divider)] bg-[color:var(--panel)]/70 p-6 shadow">
          <h2 id="signupTitle" className="m-0 text-2xl font-semibold">Criar conta</h2>
          <p className="mt-1 text-sm text-muted">Comece a usar o RadReport</p>

          <label className="mt-4 grid gap-1">
            <span className="text-sm">Nome completo</span>
            <input 
              value={name} 
              onChange={e=>setName(e.target.value)} 
              type="text" 
              required 
              className="rounded-md border border-[color:var(--divider)] bg-black/30 px-3 py-2 outline-none html:light:bg-white" 
            />
          </label>

          <label className="mt-3 grid gap-1">
            <span className="text-sm">Email</span>
            <input 
              aria-invalid={!!emailError} 
              aria-describedby={emailError? 'emailHelp': undefined} 
              value={email} 
              onChange={e=>setEmail(e.target.value)} 
              type="email" 
              required 
              className="rounded-md border border-[color:var(--divider)] bg-black/30 px-3 py-2 outline-none html:light:bg-white" 
            />
          </label>
          {emailError && <div id="emailHelp" role="alert" className="mt-1 text-xs text-red-300">{emailError}</div>}

          <label className="mt-3 grid gap-1">
            <span className="text-sm">Senha</span>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <input 
                aria-invalid={!!passwordError} 
                aria-describedby={passwordError? 'passwordHelp': undefined} 
                value={password} 
                onChange={e=>setPassword(e.target.value)} 
                type={showPass? 'text':'password'} 
                required 
                className="rounded-md border border-[color:var(--divider)] bg-black/30 px-3 py-2 outline-none html:light:bg-white" 
              />
              <button type="button" className="rounded-md border border-[color:var(--divider)] px-3 py-2" aria-pressed={showPass} onClick={()=>setShowPass(v=>!v)}>{showPass? 'Ocultar' : 'Mostrar'}</button>
            </div>
          </label>
          {passwordError && <div id="passwordHelp" role="alert" className="mt-1 text-xs text-red-300">{passwordError}</div>}

          <label className="mt-3 grid gap-1">
            <span className="text-sm">Confirmar senha</span>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <input 
                aria-invalid={!!confirmPasswordError} 
                aria-describedby={confirmPasswordError? 'confirmPasswordHelp': undefined} 
                value={confirmPassword} 
                onChange={e=>setConfirmPassword(e.target.value)} 
                type={showConfirmPass? 'text':'password'} 
                required 
                className="rounded-md border border-[color:var(--divider)] bg-black/30 px-3 py-2 outline-none html:light:bg-white" 
              />
              <button type="button" className="rounded-md border border-[color:var(--divider)] px-3 py-2" aria-pressed={showConfirmPass} onClick={()=>setShowConfirmPass(v=>!v)}>{showConfirmPass? 'Ocultar' : 'Mostrar'}</button>
            </div>
          </label>
          {confirmPasswordError && <div id="confirmPasswordHelp" role="alert" className="mt-1 text-xs text-red-300">{confirmPasswordError}</div>}

          {err && <div role="alert" className="mt-2 text-sm text-red-300">{err}</div>}
          
          <div className="mt-4">
            <TurnstileWidget
              onSuccess={(token) => {
                setTurnstileToken(token)
                setTurnstileError(null)
              }}
              onError={(error) => {
                setTurnstileToken(null)
                setTurnstileError(error)
              }}
              theme="auto"
              size="normal"
              language="pt-BR"
              appearance="interaction-only"
            />
            {turnstileError && (
              <div className="mt-1 text-xs text-red-300">
                Erro na verificação: {turnstileError}
              </div>
            )}
          </div>

          <button className="mt-4 w-full rounded-lg bg-primary px-4 py-2 text-black shadow-glow disabled:opacity-60" type="submit" disabled={disabled}>{loading? 'Criando conta…' : 'Criar conta'}</button>

          <div className="mt-3 text-center text-xs text-muted">
            Já tem uma conta? <Link to="/login" className="text-primary hover:underline">Entrar</Link>
          </div>
        </form>
      </div>
    </div>
  )
}