import { z } from 'zod'
export const SuggestSchema = z.object({
  text: z.string().min(1).max(4000),
  modality: z.string().min(1).max(20),
  organ: z.string().max(40).optional(),
  topK: z.number().min(1).max(8).optional().default(6)
})