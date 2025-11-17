import crypto from 'crypto'
import { cacheGet, cacheSet } from '../cache.js'

export const VoiceService = {
  async stt(_: { audio: string; lang?: string }){ return { text: '', commands: [] } },
  async tts({ text }: { text: string; voice?: string; rate?: number }){
    const key = 'tts:' + crypto.createHash('sha1').update(text).digest('hex')
    const hit = await cacheGet(key)
    if (hit) return { audioBase64: hit }
    const audioBase64 = '' // provider real aqui
    await cacheSet(key, audioBase64, 3600)
    return { audioBase64 }
  }
}