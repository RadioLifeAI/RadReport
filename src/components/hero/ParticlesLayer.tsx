import React, { useEffect, useRef } from 'react'

type Props = { count?: number, className?: string }
export default function ParticlesLayer({ count = 120, className }: Props){
  const ref = useRef<HTMLCanvasElement | null>(null)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
    const ctx = c.getContext('2d')!
    let w = c.offsetWidth, h = c.offsetHeight
    c.width = w * dpr; c.height = h * dpr; ctx.scale(dpr, dpr)
    const light = document.documentElement.classList.contains('light')
    const color = light ? 'rgba(2,6,23,0.45)' : 'rgba(255,255,255,0.5)'
    const dots = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.5 + 0.2,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
    }))
    let raf = 0
    const draw = () => {
      ctx.clearRect(0,0,w,h)
      ctx.fillStyle = color
      for(const d of dots){
        d.x += d.vx; d.y += d.vy
        if(d.x < -5) d.x = w+5; if(d.x > w+5) d.x = -5
        if(d.y < -5) d.y = h+5; if(d.y > h+5) d.y = -5
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI*2); ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    const onResize = () => {
      w = c.offsetWidth; h = c.offsetHeight
      c.width = w * dpr; c.height = h * dpr; ctx.scale(dpr, dpr)
    }
    window.addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize) }
  }, [count])
  return (
    <div className={`pointer-events-none absolute inset-0 -z-10 ${className||''}`}>
      <canvas ref={ref} className="h-full w-full" />
      <div className="absolute inset-0 hero-vignette" />
    </div>
  )
}