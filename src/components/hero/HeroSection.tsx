import React from 'react'
import AnimatedGradient from './AnimatedGradient'
import HeroImageBackground from './HeroImageBackground'
import AnimatedBlobsLayer from './AnimatedBlobsLayer'
import ParticlesLayer from './ParticlesLayer'

type Variant = 'gradient' | 'image' | 'blobs' | 'particles'
type Props = {
  variant?: Variant
  imageSrc?: string
  title: React.ReactNode
  subtitle?: React.ReactNode
  actions?: React.ReactNode
}

export default function HeroSection({ variant = 'gradient', imageSrc, title, subtitle, actions }: Props){
  return (
    <section className="relative flex min-h-screen w-full items-center bg-[color:var(--bg)] py-20 text-foreground">
      {variant === 'gradient' && <AnimatedGradient />}
      {variant === 'image' && imageSrc && <HeroImageBackground src={imageSrc} />}
      {variant === 'blobs' && <AnimatedBlobsLayer />}
      {variant === 'particles' && <ParticlesLayer />}
      <div className="hero-horizon" />
      <div className="container grid gap-6 md:grid-cols-2">
        <div>
          <h1 className="text-balance text-4xl font-extrabold tracking-tight md:text-6xl">{title}</h1>
          {subtitle && <p className="mt-4 max-w-xl text-muted">{subtitle}</p>}
          {actions && <div className="mt-8 flex flex-wrap items-center gap-3">{actions}</div>}
        </div>
      </div>
    </section>
  )
}