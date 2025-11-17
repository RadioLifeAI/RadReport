import { z } from 'zod'
export const CompleteSchema = z.object({
  textPrefix: z.string().min(1).max(400),
  modality: z.string().min(1).max(20)
})