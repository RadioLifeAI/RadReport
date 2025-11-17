import { MACROS, TEMPLATES } from './templates'

export type CommandResult = { type: 'insert' | 'navigate' | 'style' | 'generate' | 'check' | 'template'; payload?: any }

export function parseCommand(input: string): CommandResult | null {
  const s = input.trim().toLowerCase()
  if (s.startsWith('inserir macro') || s.startsWith('macro ')) {
    const key = s.replace('inserir', '').replace('macro', '').trim()
    const macro = MACROS.find(m => m.chave.toLowerCase().includes(key))
    if (macro) return { type: 'insert', payload: macro.texto }
  }
  if (s.startsWith('template ')) {
    const key = s.replace('template', '').trim()
    const t = TEMPLATES.find(t => t.titulo.toLowerCase().includes(key) || t.modalidade.toLowerCase() === key)
    if (t) return { type: 'template', payload: t }
  }
  if (s.startsWith('ir para')) {
    const section = s.replace('ir para', '').trim()
    return { type: 'navigate', payload: section }
  }
  if (s.startsWith('estilo')) {
    const style = s.replace('estilo', '').trim()
    return { type: 'style', payload: style }
  }
  if (s.includes('gerar conclusão')) return { type: 'generate', payload: 'conclusao' }
  if (s.includes('verificar consistência')) return { type: 'check' }
  return null
}