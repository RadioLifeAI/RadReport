import express from 'express'
import compression from 'compression'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import { withUser, pool } from './db.js'
import { cacheGet, cacheSet, initRedis } from './cache.js'
import { strongETag } from './etag.js'
import { startTelemetry } from './telemetry.js'
import { aiRouter } from './routes/ai.js'
import cookieParser from 'cookie-parser'
import authRouter from './routes/auth.js'
import syncRouter from './routes/sync.js'
import turnstileRouter from '../../api/routes/turnstile.js'
import { authMiddleware } from './middleware/auth.js'
import { correlationIdMiddleware, errorHandler } from './middleware/error.js'
import { FindingsSemanticSchema } from './schemas/semantic.js'
import { PrefsSchema } from './schemas/prefs.js'
import { UsageSchema } from './schemas/usage.js'
import { DeltaSchema } from './schemas/sync.js'

const app = express()
app.disable('x-powered-by')
app.use(compression())
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())
app.use(correlationIdMiddleware)

const ORIGIN = process.env.ALLOWED_ORIGIN || '*'
app.use(cors({ origin: ORIGIN, credentials: true }))
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "img-src": ["'self'", 'data:'],
      "connect-src": ["'self'", 'https://accounts.google.com', 'https://oauth2.googleapis.com', 'https://www.googleapis.com'],
      "script-src": ["'self'", 'https://accounts.google.com/gsi/client'],
    },
  },
  referrerPolicy: { policy: 'no-referrer' }
}))

const limiter = rateLimit({ windowMs: 60_000, max: 200 })
app.use(limiter)

function sendJSON(req: any, res: any, payload: any){
  const et = strongETag(payload)
  if (req.headers['if-none-match'] === et) return res.status(304).end()
  res.setHeader('ETag', et)
  res.setHeader('Vary', 'Accept-Encoding, If-None-Match')
  res.setHeader('Cache-Control', 'public, max-age=60')
  res.json({ data: payload })
}

app.get('/v1/templates', async (req, res) => {
  const mod = req.query.mod as string | undefined
  const key = `tpl:mod:${mod || 'all'}`
  const hit = await cacheGet(key)
  if (hit) { res.setHeader('X-Cache','HIT'); return sendJSON(req, res, JSON.parse(hit)) }
  const rows = await withUser(null, async c => {
    const q = mod ? `select * from v_templates_public where modality=$1 order by sort_order, updated_at desc limit 500` : `select * from v_templates_public order by updated_at desc limit 500`
    const r = await c.query(q, mod ? [mod] : [])
    return r.rows
  })
  await cacheSet(key, JSON.stringify(rows), 1800)
  res.setHeader('X-Cache','MISS')
  sendJSON(req, res, rows)
})

app.get('/v1/templates/:id', async (req, res) => {
  const id = req.params.id
  const rows = await withUser(null, async c => {
    const r = await c.query(`select * from v_templates_public where template_id=$1`, [id])
    return r.rows
  })
  if (!rows.length) return res.status(404).json({ error: { code: 'not_found', message: 'Template not found' } })
  sendJSON(req, res, rows[0])
})

app.get('/v1/sentences', async (req, res) => {
  const mod = req.query.mod as string | undefined
  const key = `sent:mod:${mod || 'all'}`
  const hit = await cacheGet(key)
  if (hit) { res.setHeader('X-Cache','HIT'); return sendJSON(req, res, JSON.parse(hit)) }
  const rows = await withUser(null, async c => {
    const q = mod ? `select * from v_sentences_by_mod where modality=$1 order by updated_at desc limit 1000` : `select * from v_sentences_by_mod order by updated_at desc limit 1000`
    const r = await c.query(q, mod ? [mod] : [])
    return r.rows
  })
  await cacheSet(key, JSON.stringify(rows), 3600)
  res.setHeader('X-Cache','MISS')
  sendJSON(req, res, rows)
})

app.get('/v1/findings', async (req, res) => {
  const mod = req.query.mod as string | undefined
  const q = req.query.q as string | undefined
  const rows = await withUser(null, async c => {
    if (q) {
      const r = await c.query(`select finding_id, modality, description, ready_phrase from findings where ($1::text is null or modality=$1) and description ilike '%'||$2||'%' order by updated_at desc limit 100`, [mod || null, q])
      return r.rows
    }
    const r = await c.query(`select finding_id, modality, description, ready_phrase from findings where ($1::text is null or modality=$1) order by updated_at desc limit 100`, [mod || null])
    return r.rows
  })
  sendJSON(req, res, rows)
})

app.post('/v1/findings/semantic', async (req, res, next) => {
  const parsed = FindingsSemanticSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error:'Invalid payload', code:'BAD_REQUEST', details: parsed.error.flatten() })
  const { vector, modality: mod, k = 20 } = parsed.data
  const rows = await withUser(null, async c => {
    const sql = mod ? `select finding_id, modality, description, ready_phrase, embed_vector <=> $1 as distance from findings where modality=$2 order by embed_vector <=> $1 asc limit $3` : `select finding_id, modality, description, ready_phrase, embed_vector <=> $1 as distance from findings order by embed_vector <=> $1 asc limit $2`
    const params = mod ? [vector, mod, k] : [vector, k]
    const r = await c.query(sql, params)
    return r.rows
  })
  res.json({ data: rows })
})

app.post('/v1/sync/delta', async (req, res) => {
  const p = DeltaSchema.parse(req.body || {})
  const { since, entities } = p
  const rows = await withUser(null, async c => {
    const r = await c.query(`select * from get_changes($1::timestamptz, $2::text[])`, [since || '1970-01-01', entities || null])
    return r.rows
  })
  const deleted = await withUser(null, async c => {
    const r = await c.query(`select entity, entity_id, deleted_at from deleted_items where deleted_at > $1 order by deleted_at asc limit 1000`, [since || '1970-01-01'])
    return r.rows
  })
  const nextSince = new Date().toISOString()
  res.json({ changes: rows, deleted, nextSince })
})

app.get('/v1/prefs', authMiddleware, async (req: any, res) => {
  const uid = req.user.id as string
  const row = await withUser(uid, async c => {
    const r = await c.query(`select * from user_preferences where user_id=$1`, [uid])
    return r.rows[0] || { user_id: uid, dark_mode: true }
  })
  res.json({ data: row })
})

app.put('/v1/prefs', authMiddleware, async (req: any, res) => {
  const uid = req.user.id as string
  const body = PrefsSchema.parse(req.body || {})
  const row = await withUser(uid, async c => {
    const r = await c.query(`insert into user_preferences(user_id, favorite_templates, favorite_sentences, dark_mode, voice_name, voice_rate, style_prefs, updated_at) values($1,$2,$3,$4,$5,$6,$7, now()) on conflict (user_id) do update set favorite_templates=excluded.favorite_templates, favorite_sentences=excluded.favorite_sentences, dark_mode=excluded.dark_mode, voice_name=excluded.voice_name, voice_rate=excluded.voice_rate, style_prefs=excluded.style_prefs, updated_at=now() returning *`, [uid, body.favorite_templates, body.favorite_sentences, body.dark_mode, body.voice_name || null, body.voice_rate, body.style_prefs])
    return r.rows[0]
  })
  res.json({ data: row })
})

app.post('/v1/usage', authMiddleware, async (req: any, res) => {
  const uid = req.user.id as string
  const body = UsageSchema.parse(req.body || {})
  await withUser(uid, async c => {
    await c.query(`insert into usage_history(user_id, template_id, frases_usadas, modality, action, metadata) values($1,$2,$3,$4,$5,$6)`, [uid, body.template_id || null, body.frases_usadas, body.modality || null, body.action, body.metadata])
  })
  res.status(201).json({ data: { ok: true } })
})

app.use('/v1/auth', authRouter)
app.use('/v1/sync', syncRouter)
app.use('/v1/ai', aiRouter)
app.use('/api/turnstile', turnstileRouter)

const port = Number(process.env.PORT || 8787)
startTelemetry()
initDb()
  .then(() => initRedis())
  .then(() => app.listen(port, () => console.log(`api on :${port}`)))
app.use(errorHandler)
async function initDb(){
  const client = await pool.connect()
  try{
    await client.query(`create extension if not exists pgcrypto;`)
    await client.query(`
      create table if not exists users(
        user_id uuid primary key,
        email text unique not null,
        updated_at timestamptz not null default now()
      );
    `)
    await client.query(`create unique index if not exists users_email_lower_unique on users(lower(email));`)
    await client.query(`
      create table if not exists user_providers(
        user_id uuid references users(user_id) on delete cascade,
        provider text not null,
        provider_id text not null,
        updated_at timestamptz not null default now(),
        primary key(user_id, provider)
      );
    `)
    await client.query(`
      create table if not exists users_auth(
        user_id uuid primary key references users(user_id) on delete cascade,
        password_hash text not null,
        password_version smallint not null default 1,
        failed_attempts int not null default 0,
        locked_until timestamptz null,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );
    `)
  } finally { client.release() }
}