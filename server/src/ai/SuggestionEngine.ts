import { z } from 'zod'

const SuggestOut = z.object({
  suggestions: z.array(z.object({ type: z.enum(['phrase','macro','edit']).optional(), text: z.string(), rationale: z.string().optional() })).default([]),
  conclusion: z.object({ text: z.string() }).optional()
})

const DiffOut = z.object({ list: z.array(z.object({ diagnosis: z.string(), evidence: z.string().optional() })).default([]) })

export const SuggestionEngine = {
  parseSuggest(out: string){
    try { return SuggestOut.parse(JSON.parse(out)) } catch { return { suggestions: [], conclusion: undefined } }
  },
  parseDifferentials(out: string){
    try { return DiffOut.parse(JSON.parse(out)) } catch { return { list: [] } }
  }
}