import { z } from 'zod'
export const UsageSchema = z.object({
  template_id: z.string().uuid().nullable().optional(),
  frases_usadas: z.array(z.string().uuid()).optional().default([]),
  modality: z.string().min(1).max(20).nullable().optional(),
  action: z.string().min(2).max(20).optional().default('generate'),
  metadata: z.record(z.any()).optional().default({})
})