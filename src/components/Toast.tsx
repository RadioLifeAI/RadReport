import React, { createContext, useContext, useEffect, useState } from 'react'

type Toast = { id: string; text: string }
const Ctx = createContext<{ push: (t: string) => void } | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }){
  const [items, setItems] = useState<Toast[]>([])
  function push(text: string){
    const id = Math.random().toString(36).slice(2)
    setItems(x => [...x, { id, text }])
    setTimeout(() => setItems(x => x.filter(i => i.id !== id)), 3500)
  }
  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div style={{ position:'fixed', right:16, bottom:16, display:'grid', gap:8, zIndex:9999 }}>
        {items.map(i => (
          <div key={i.id} style={{ background:'#0f1628', color:'#e5e7eb', padding:'10px 12px', border:'1px solid #223', borderRadius:8, boxShadow:'0 10px 30px rgba(0,0,0,.35)' }}>{i.text}</div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export function useToast(){
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('ToastProvider missing')
  return ctx
}