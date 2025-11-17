import { z } from 'zod'
export const TtsSchema = z.object({
  text: z.string().min(1).max(1000),
  voice: z.string().optional(),
  rate: z.number().min(0.8).max(1.2).optional().default(1.0)
})