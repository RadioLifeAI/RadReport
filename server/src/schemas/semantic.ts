import { z } from 'zod'
export const FindingsSemanticSchema = z.object({
  text: z.string().min(1).max(4000).optional(),
  modality: z.string().min(1).max(20).optional(),
  vector: z.array(z.number()).min(10).max(4096).optional(),
  k: z.number().min(1).max(50).optional().default(20)
}).refine(d => !!d.vector || !!d.text, { message:'text or vector required' })