import { z } from 'zod'
export const DeltaSchema = z.object({
  since: z.string().datetime().optional(),
  entities: z.array(z.enum(['templates','smart_sentences','findings'])).optional()
})