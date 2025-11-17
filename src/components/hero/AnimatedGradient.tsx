import React from 'react'

type Props = { className?: string }
export default function AnimatedGradient({ className }: Props){
  return (
    <div className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className||''}`}>
      <div className="absolute inset-0 rr-animated-gradient opacity-60" />
      <div className="absolute inset-0 hero-vignette" />
    </div>
  )
}