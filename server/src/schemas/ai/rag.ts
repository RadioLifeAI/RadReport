import { z } from 'zod'
export const RagSearchSchema = z.object({
  q: z.string().min(1).max(400),
  modality: z.string().min(1).max(20),
  k: z.number().min(1).max(8).optional().default(6)
})