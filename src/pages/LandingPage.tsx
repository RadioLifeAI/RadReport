import React from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import HeroSection from '../components/hero/HeroSection'
import { Link } from 'react-router-dom'

export default function LandingPage(){
  return (
    <div className="min-h-screen bg-[color:var(--bg)] text-foreground">
      <Header />

      <HeroSection
        variant="gradient"
        title={<>Laudos estruturados com inteligência artificial.</>}
        subtitle={<>Plataforma para laudos radiológicos com eficiência, precisão e padronização.</>}
        actions={
          <>
            <Link to="/login" className="rounded-full border border-white/15 bg-black/70 px-6 py-3 text-foreground shadow-[var(--glow-cyan)] backdrop-blur transition hover:bg-black/80 html:light:bg-black/10 html:light:text-foreground">Experimente gratuitamente ✨</Link>
            <a href="#servicos" className="rounded-full border border-[color:var(--divider)] px-6 py-3 text-foreground hover:bg-white/5">Saiba mais</a>
          </>
        }
      />

      <section id="servicos" className="container py-16">
        <h2 className="mb-8 text-center text-3xl font-bold md:text-4xl">Nossos serviços</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[{t:'Planos corporativos',d:'Pacotes sob medida para equipes, com eficiência e escala.'},{t:'API de análise',d:'Integre laudos e gere insights para BI e decisões.'},{t:'Agentes IA',d:'Agentes personalizados para workflows específicos.'},{t:'Reconhecimento de voz',d:'Transcrição em tempo real com ótima acurácia.'},{t:'Templates inteligentes',d:'Modelos por modalidade, prontos para uso.'},{t:'Consultoria',d:'Acompanhamento para otimizar seus processos.'}].map((c)=> (
            <div key={c.t} className="group rounded-2xl border border-[color:var(--divider)] bg-gradient-to-br from-cyan-500/10 via-indigo-500/10 to-transparent p-5 shadow hover:bg-white/10">
              <div className="text-lg font-semibold">{c.t}</div>
              <div className="text-sm text-muted">{c.d}</div>
              <button className="mt-4 rounded-full border border-[color:var(--divider)] px-4 py-2 text-sm hover:bg-white/10">Saiba mais</button>
            </div>
          ))}
        </div>
      </section>

      <section id="precos" className="container py-16">
        <h2 className="mb-8 text-center text-3xl font-bold md:text-4xl">Planos</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {n:'Básico',p:'R$ 219,00',f:['1.350 créditos I.A. mensais','Laudos estruturados','Voz em tempo real','Autotexto']},
            {n:'Pro',p:'R$ 349,00',f:['4.350 créditos I.A. mensais','Mais recursos','Melhor custo-benefício','Suporte prioritário']},
            {n:'Premium',p:'R$ 469,00',f:['7.050 créditos I.A. mensais','Automação total','Acesso antecipado a novidades','Suporte premium']},
          ].map((card, i)=> (
            <div key={card.n} className={`rounded-2xl border border-[color:var(--divider)] bg-white/5 p-6 ${i===1? 'ring-2 ring-cyan-400/40 html:light:ring-cyan-600/30':''}`}>
              <div className="text-sm text-muted">{card.n.toUpperCase()}</div>
              <div className="mt-2 text-3xl font-bold">{card.p} <span className="text-base font-normal text-muted">/ mês</span></div>
              <ul className="mt-4 space-y-2 text-sm text-muted">
                {card.f.map((x)=> <li key={x}>✓ {x}</li>)}
              </ul>
              <button className="mt-6 w-full rounded-lg bg-cyan-400 px-4 py-2 text-black shadow-glow hover:brightness-105">Inicie gratuitamente</button>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="container py-16">
        <h2 className="mb-8 text-center text-3xl font-bold md:text-4xl">Dúvidas frequentes</h2>
        <div className="mx-auto max-w-3xl divide-y divide-[color:var(--divider)] rounded-xl border border-[color:var(--divider)]">
          {[
            {q:'Como funcionam os créditos?',a:'Cada ação de IA consome uma pequena quantidade de créditos conforme o recurso utilizado.'},
            {q:'O que acontece se meus créditos acabarem?',a:'Você pode adquirir pacotes adicionais ou aguardar a renovação mensal do seu plano.'},
            {q:'Quais funcionalidades estão incluídas nos planos?',a:'Depende do plano escolhido; veja a tabela de preços para detalhes.'},
          ].map((it)=> (
            <details key={it.q} className="group">
              <summary className="cursor-pointer list-none p-4 hover:bg-white/5">{it.q}</summary>
              <div className="p-4 pt-0 text-sm text-muted">{it.a}</div>
            </details>
          ))}
        </div>
      </section>

      <section id="assistente" className="container py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h3 className="text-2xl font-semibold md:text-3xl">Fale com o nosso Assistente IA.</h3>
          <p className="mt-2 text-muted">Obtenha respostas sobre produtos e serviços e faça um pré-atendimento.</p>
          <div className="mt-6 rounded-2xl border border-[color:var(--divider)] bg-white/5 p-6">
            <input placeholder="Quais os passos para criar um laudo?" className="w-full rounded-lg border border-[color:var(--divider)] bg-black/30 px-4 py-3 outline-none placeholder:text-muted html:light:bg-white" />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}