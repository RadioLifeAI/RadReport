import { z } from 'zod'
export const DiffSchema = z.object({
  findings: z.array(z.object({ term: z.string().min(1), qualifiers: z.array(z.string()).optional() })).min(1),
  modality: z.string().min(1).max(20)
})