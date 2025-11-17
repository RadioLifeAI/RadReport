import React, { useEffect, useRef, useState } from 'react'
import { parseCommand } from '../lib/commands'

type Props = { onText: (t: string) => void; onCommand: (cmd: ReturnType<typeof parseCommand>) => void }

export default function VoiceButton({ onText, onCommand }: Props){
  const [active, setActive] = useState(false)
  const recRef = useRef<any>(null)

  useEffect(() => {
    const w = window as any
    const Rec = w.SpeechRecognition || w.webkitSpeechRecognition
    if (!Rec) return
    const rec = new Rec()
    rec.lang = 'pt-BR'
    rec.continuous = true
    rec.interimResults = true
    rec.onresult = (e: any) => {
      let finalText = ''
      for (let i = e.resultIndex; i < e.results.length; i++){
        const res = e.results[i]
        const txt = res[0].transcript
        if (res.isFinal){
          const cmd = parseCommand(txt)
          if (cmd) onCommand(cmd)
          else onText(txt.trim() + ' ')
          finalText += txt
        }
      }
    }
    recRef.current = rec
  }, [onText, onCommand])

  function toggle(){
    const rec = recRef.current
    if (!rec) return alert('Reconhecimento de voz não suportado neste navegador')
    if (active){ rec.stop(); setActive(false) }
    else { rec.start(); setActive(true) }
  }

  return (
    <button className={`btn`} onClick={toggle} aria-pressed={active} title="Ditado por voz">
      {active ? '⏹️ Parar' : '🎙️ Ditado'}
    </button>
  )
}