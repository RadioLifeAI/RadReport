import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function Header(){
  const stored = typeof window !== 'undefined' ? localStorage.getItem('rr.theme') : null
  const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  const [dark, setDark] = useState(stored ? stored === 'dark' : prefersDark)
  useEffect(()=>{
    const root = document.documentElement
    if (dark){ root.classList.add('dark'); root.classList.remove('light') } else { root.classList.add('light'); root.classList.remove('dark') }
    ;(root as any).style.colorScheme = dark ? 'dark':'light'
    try{ localStorage.setItem('rr.theme', dark ? 'dark':'light') }catch{}
  },[dark])
  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--divider)] bg-[color:var(--panel)]/80 backdrop-blur">
      <div className="container flex items-center justify-between py-3">
        <Link to="/" className="flex items-center gap-2 text-foreground">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400/50 to-indigo-500/30" />
          <span className="font-semibold tracking-tight">RadReport</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <a href="#como-funciona" className="text-muted hover:text-foreground">Visão geral</a>
          <a href="#servicos" className="text-muted hover:text-foreground">Serviços</a>
          <a href="#precos" className="text-muted hover:text-foreground">Planos</a>
          <a href="#faq" className="text-muted hover:text-foreground">FAQ</a>
          <button aria-label="Alternar tema" className="rounded-lg border border-white/10 px-3 py-2" onClick={()=>setDark(v=>!v)}>{dark? '☀︎':'☾'}</button>
          <Link to="/login" className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-cyan-300 shadow-glow hover:bg-cyan-400/20">Entrar</Link>
        </nav>
      </div>
    </header>
  )
}