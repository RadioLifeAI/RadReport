import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { cacheGet, cacheSet } from '../cache.js'
import { authMiddleware } from '../middleware/auth.js'
import { SuggestSchema } from '../schemas/ai/suggest.js'
import { CompleteSchema } from '../schemas/ai/complete.js'
import { DiffSchema } from '../schemas/ai/diff.js'
import { RagSearchSchema } from '../schemas/ai/rag.js'
import { SttSchema } from '../schemas/ai/stt.js'
import { TtsSchema } from '../schemas/ai/tts.js'
import { ContextBuilder } from '../ai/ContextBuilder.js'
import { PromptBuilder } from '../ai/PromptBuilder.js'
import { LLMClient } from '../ai/LLMClient.js'
import { SuggestionEngine } from '../ai/SuggestionEngine.js'
import { withUser } from '../db.js'
import { SemanticSearchService } from '../ai/SemanticSearchService.js'
import { VoiceService } from '../ai/VoiceService.js'

export const aiRouter = Router()
const iaRate = Number(process.env.IA_RATE_LIMIT || 20)
aiRouter.use(rateLimit({ windowMs: 60_000, max: iaRate }))
aiRouter.use(authMiddleware)

aiRouter.post('/suggest', async (req: any, res) => {
  const p = SuggestSchema.parse(req.body)
  const ctx = await ContextBuilder.build({ text: p.text, modality: p.modality, organ: p.organ, userId: req.user.id, topK: p.topK })
  const key = `ai:suggest:${Buffer.from((p.text + p.modality + (p.organ||'') + p.topK)).toString('base64').slice(0,64)}`
  const hit = await cacheGet(key)
  if (hit) return res.json({ data: JSON.parse(hit) })
  const out = await LLMClient.complete(PromptBuilder.suggestion(ctx), { temperature: 0.2 })
  const data = SuggestionEngine.parseSuggest(out)
  await cacheSet(key, JSON.stringify(data), 300)
  res.json({ data })
})

aiRouter.post('/complete', async (req: any, res) => {
  const p = CompleteSchema.parse(req.body)
  const key = `ai:complete:${Buffer.from((p.textPrefix + p.modality)).toString('base64').slice(0,64)}`
  const hit = await cacheGet(key)
  if (hit) return res.json({ data: JSON.parse(hit) })
  const out = await LLMClient.complete(PromptBuilder.complete(p.textPrefix, p.modality), { temperature: 0.1 })
  const data = { completion: out }
  await cacheSet(key, JSON.stringify(data), 180)
  res.json({ data })
})

aiRouter.post('/differentials', async (req: any, res) => {
  const p = DiffSchema.parse(req.body)
  const out = await LLMClient.complete(PromptBuilder.differentials(p.findings, p.modality), { temperature: 0.2 })
  const data = SuggestionEngine.parseDifferentials(out)
  res.json({ data })
})

aiRouter.get('/rag/search', async (req: any, res) => {
  const p = RagSearchSchema.parse({ q: String(req.query.q||''), modality: String(req.query.mod||''), k: req.query.k? Number(req.query.k): undefined })
  const rows = await withUser(req.user.id, async c => SemanticSearchService.searchText(c as any, p.q, p.modality, p.k))
  res.json({ data: rows })
})

aiRouter.get('/debug/context', async (req: any, res) => {
  const modality = String(req.query.mod||'')
  const text = String(req.query.text||'')
  const ctx = await ContextBuilder.build({ text, modality, userId: req.user.id, topK: 6 })
  res.json({ data: ctx })
})

aiRouter.post('/voice/stt', async (req: any, res) => {
  const p = SttSchema.parse(req.body)
  const out = await VoiceService.stt(p)
  res.json({ data: out })
})

aiRouter.post('/voice/tts', async (req: any, res) => {
  const p = TtsSchema.parse(req.body)
  const out = await VoiceService.tts(p)
  res.json({ data: out })
})