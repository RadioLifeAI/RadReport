import { z } from 'zod'
export const PrefsSchema = z.object({
  favorite_templates: z.array(z.string().uuid()).optional().default([]),
  favorite_sentences: z.array(z.string().uuid()).optional().default([]),
  dark_mode: z.boolean().optional().default(true),
  voice_name: z.string().nullable().optional(),
  voice_rate: z.number().min(0.5).max(2).optional().default(1.0),
  style_prefs: z.record(z.any()).optional().default({})
})