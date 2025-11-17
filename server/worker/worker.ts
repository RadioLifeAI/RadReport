import { Pool } from 'pg'
import { createClient } from 'redis'
import { embed } from './embeddings.js'
import { rebuildLexicon } from './lexicon.js'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const redis = process.env.REDIS_URL ? createClient({ url: process.env.REDIS_URL }) : null

async function warmTemplates(mod?: string){
  const c = await pool.connect()
  try {
    const r = mod
      ? await c.query(`select * from v_templates_public where modality=$1 order by sort_order, updated_at desc limit 500`, [mod])
      : await c.query(`select * from v_templates_public order by updated_at desc limit 500`)
    if (redis?.isOpen) await redis.set(`tpl:mod:${mod || 'all'}`, JSON.stringify(r.rows), { EX: 1800 })
  } finally { c.release() }
}

async function warmSentences(mod?: string){
  const c = await pool.connect()
  try {
    const r = mod
      ? await c.query(`select * from v_sentences_by_mod where modality=$1 order by updated_at desc limit 1000`, [mod])
      : await c.query(`select * from v_sentences_by_mod order by updated_at desc limit 1000`)
    if (redis?.isOpen) await redis.set(`sent:mod:${mod || 'all'}`, JSON.stringify(r.rows), { EX: 3600 })
  } finally { c.release() }
}

async function warmAISuggestSamples(){
  if (!redis?.isOpen) return
  const samples = [
    { text: 'Parênquima pulmonar sem consolidações evidentes.', modality: 'TC' },
    { text: 'Fígado de contornos preservados e ecotextura homogênea.', modality: 'USG' }
  ]
  for (const s of samples){
    const key = 'ai:suggest:' + Buffer.from(s.text + s.modality).toString('base64').slice(0,64)
    await redis.set(key, JSON.stringify({ suggestions:[{ type:'phrase', text:s.text }], conclusion:{ text:'Estudo sem alterações significativas.' } }), { EX: 300 })
  }
}

async function handleEvent(msg: any){
  const { table, op, id } = msg
  if (!table || !id) return
  if (['smart_sentences','findings'].includes(table) && ['INSERT','UPDATE','insert','update'].includes(op)){
    const client = await pool.connect()
    try{
      const sql = table === 'smart_sentences' ? `select frase_id as id, text, modality from smart_sentences where frase_id=$1` : `select finding_id as id, description as text, modality from findings where finding_id=$1`
      const r = await client.query(sql, [id])
      if (!r.rows.length) return
      const text = r.rows[0].text as string
      const vec = await embed(text)
      const upd = table === 'smart_sentences' ? `update smart_sentences set embed_vector=$1 where frase_id=$2` : `update findings set embed_vector=$1 where finding_id=$2`
      await client.query(upd, [vec, id])
      // invalidate redis for modality lists
      if (redis?.isOpen) {
        await redis.del(`${table==='smart_sentences'?'sent':'find'}:mod:${r.rows[0].modality || 'all'}`)
        await warmSentences(r.rows[0].modality)
      }
    } finally { client.release() }
  }
}

async function main(){
  const c = await pool.connect()
  await c.query('listen events')
  c.on('notification', async (n) => {
    try{ await handleEvent(JSON.parse(n.payload || '{}')) }catch{}
  })
  if (redis && !redis.isOpen) await redis.connect()
  const topN = Number(process.env.LEXICON_TOPN || 2000)
  setInterval(() => rebuildLexicon(pool, topN).catch(()=>{}), 10*60*1000)
  setInterval(() => { warmTemplates().catch(()=>{}); warmSentences().catch(()=>{}); warmAISuggestSamples().catch(()=>{}) }, 15*60*1000)
  console.log('worker running (events + lexicon)')
}

main().catch(e=>{ console.error(e); process.exit(1) })