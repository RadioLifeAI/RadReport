import { z } from 'zod'
export const SttSchema = z.object({
  audio: z.string().min(10),
  lang: z.string().optional().default('pt-BR')
})