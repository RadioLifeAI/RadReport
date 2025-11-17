import express from 'express'
import { pool } from '../db.js'

const router = express.Router()

router.post('/push', async (req, res) => {
  const ops = Array.isArray(req.body?.ops) ? req.body.ops : []
  const applied: string[] = []
  const client = await pool.connect()
  try{
    await client.query('begin')
    for (const op of ops){
      const exists = await client.query('select 1 from audit_log_cloud where op_id=$1', [op.op_id])
      if (exists.rowCount) continue
      await client.query('insert into audit_log_cloud(op_id, entity, entity_id, op_type, payload, device_id, user_id, ts) values($1,$2,$3,$4,$5,$6,$7,$8)', [op.op_id, op.entity, op.entity_id, op.op_type, op.payload, op.device_id || null, op.user_id || null, op.updated_at || new Date().toISOString()])
      applied.push(op.op_id)
    }
    await client.query('commit')
    return res.json({ applied })
  }catch(e){
    await client.query('rollback')
    return res.status(500).json({ error: 'push_failed' })
  }finally{ client.release() }
})

router.get('/pull', async (req, res) => {
  const since = String(req.query.since || '')
  const client = await pool.connect()
  try{
    const r = await client.query('select entity, entity_id, payload, ts as updated_at from audit_log_cloud where ts > $1 order by ts asc limit 500', [since || '1970-01-01T00:00:00Z'])
    const nextSince = r.rows.length ? r.rows[r.rows.length - 1].updated_at : since
    return res.json({ changes: r.rows, nextSince })
  }catch{
    return res.status(500).json({ error: 'pull_failed' })
  }finally{ client.release() }
})

export default router