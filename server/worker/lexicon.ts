import { Pool } from 'pg'

function tokenize(s: string){
  return s.toLowerCase().normalize('NFKD').replace(/[^a-zà-ú0-9\s]/g,' ').split(/\s+/).filter(Boolean)
}

function ngrams(tokens: string[], n: 1|2|3){
  const out: string[] = []
  for (let i=0;i<=tokens.length-n;i++) out.push(tokens.slice(i,i+n).join(' '))
  return out
}

export async function rebuildLexicon(pool: Pool, topN = 2000){
  const client = await pool.connect()
  try{
    const res = await client.query(`select modality, text from smart_sentences where text is not null union all select modality, description as text from findings where description is not null`)
    const freq = new Map<string, number>()
    for (const row of res.rows){
      const mod = row.modality || 'Geral'
      const toks = tokenize(row.text)
      for (const n of [1,2,3] as const){
        for (const g of ngrams(toks, n)){
          const key = `${mod}|${g}`
          freq.set(key, (freq.get(key)||0)+1)
        }
      }
    }
    // Take topN per modality
    const buckets = new Map<string, [string,number][]>()
    for (const [key,f] of freq){
      const [mod,gram] = key.split('|')
      const arr = buckets.get(mod) || []
      arr.push([gram,f]); buckets.set(mod, arr)
    }
    const batch: {mod:string, gram:string, f:number}[] = []
    for (const [mod, arr] of buckets){
      arr.sort((a,b)=>b[1]-a[1])
      for (const [gram,f] of arr.slice(0, topN)) batch.push({mod, gram, f})
    }
    await client.query('begin')
    await client.query('truncate lexicon')
    const text = 'insert into lexicon(modality, ngram, freq) values($1,$2,$3)'
    for (const row of batch){ await client.query(text, [row.mod, row.gram, row.f]) }
    await client.query('commit')
  }catch(e){ await client.query('rollback'); throw e } finally { client.release() }
}