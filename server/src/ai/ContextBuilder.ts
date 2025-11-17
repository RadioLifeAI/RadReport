import { withUser } from '../db.js'
import { SemanticSearchService } from './SemanticSearchService.js'

type BuildParams = { text: string, modality: string, organ?: string, userId: string, topK: number }

export const ContextBuilder = {
  async build(p: BuildParams){
    const findings: string[] = p.text ? [p.text] : []
    const passages = await withUser(p.userId, async (c) => {
      // Sem vetor local: fallback por texto
      const r = await SemanticSearchService.searchText(c as any, p.text.slice(0, 200), p.modality, Math.max(1, Math.min(8, p.topK)))
      return r.map(x => x.text)
    })
    // Estilo do usuário (placeholder sem PII)
    const userStyle = { formalidade: 'equilibrada' }
    return { modality: p.modality, organ: p.organ, findings, userStyle, passages }
  }
}