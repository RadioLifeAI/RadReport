export type EmbProvider = 'local'|'openai'|'azure'|'gcp'

export async function embed(text: string): Promise<number[]>{
  const provider = (process.env.EMB_PROVIDER || 'local') as EmbProvider
  if (!text?.trim()) return []
  if (provider === 'local'){
    // Hash-based pseudo-embedding (placeholder) – substitute by real provider in prod
    const arr = new Array(1536).fill(0)
    let h = 0
    for (let i=0;i<text.length;i++){ h = (h*31 + text.charCodeAt(i)) >>> 0; arr[i % 1536] += (h % 1000)/1000 }
    return arr
  }
  // TODO: call real provider using EMB_API_KEY
  throw new Error('External embedding provider not configured')
}