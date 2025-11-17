import React from 'react'

type Props = { src: string, className?: string }
export default function HeroImageBackground({ src, className }: Props){
  return (
    <div className={`pointer-events-none absolute inset-0 -z-10 ${className||''}`}>
      <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-transparent html:light:from-white/40 html:light:via-white/20 html:light:to-transparent" />
      <div className="absolute inset-0 hero-vignette" />
    </div>
  )
}