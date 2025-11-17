import React from 'react'
import AnimatedGradient from './hero/AnimatedGradient'
import ParticlesLayer from './hero/ParticlesLayer'
import { Github, Instagram, Linkedin } from 'lucide-react'

export default function Footer(){
  return (
    <footer className="relative overflow-hidden border-t border-[color:var(--divider)] bg-[color:var(--panel)]/90 text-foreground">
      <div className="footer-top-glow" />
      <div className="footer-bar" />
      <AnimatedGradient className="opacity-30" />
      <ParticlesLayer count={80} />

      <div className="container relative z-10 grid gap-8 py-10 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400/50 to-indigo-500/30" />
            <h4 className="m-0 font-semibold">RadReport</h4>
          </div>
          <p className="mt-2 max-w-sm text-sm text-muted">Laudos radiológicos com IA. Rapidez, padronização e precisão clínica.</p>
        </div>
        <div className="grid gap-2 text-sm">
          <div className="text-xs tracking-wide text-muted">Produto</div>
          <a href="#servicos" className="text-muted hover:text-foreground">Serviços</a>
          <a href="#precos" className="text-muted hover:text-foreground">Planos</a>
          <a href="#faq" className="text-muted hover:text-foreground">FAQ</a>
        </div>
        <div className="grid gap-3">
          <div className="text-xs tracking-wide text-muted">Contato</div>
          <div className="flex items-center gap-3 text-sm">
            <a aria-label="LinkedIn" href="#" className="rounded-md border border-[color:var(--divider)] p-2 hover:bg-white/5"><Linkedin size={16} /></a>
            <a aria-label="Instagram" href="#" className="rounded-md border border-[color:var(--divider)] p-2 hover:bg-white/5"><Instagram size={16} /></a>
            <a aria-label="GitHub" href="#" className="rounded-md border border-[color:var(--divider)] p-2 hover:bg-white/5"><Github size={16} /></a>
          </div>
        </div>
      </div>

      <div className="relative z-10 border-t border-[color:var(--divider)] py-4 text-center text-xs text-muted">© {new Date().getFullYear()} RadReport</div>
    </footer>
  )
}