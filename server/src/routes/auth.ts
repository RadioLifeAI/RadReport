import express from 'express'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import { signAccessToken, signRefreshToken, verifyRefreshToken, TTL, verifyAccessToken } from '../utils/jwt.js'
import { pool } from '../db.js'
import { requireCsrf, setCsrfCookie } from '../middleware/csrf.js'
import crypto from 'crypto'
import { upsertUserToSupabase } from '../cloud/supabase.js'

const router = express.Router()
router.use(cookieParser())
const socialLimiter = rateLimit({ windowMs: 60_000, max: 30 })
const registerLimiter = rateLimit({ windowMs: 60_000, max: 20 })
const passwordLimiter = rateLimit({ windowMs: 60_000, max: 60 })

router.post('/login', async (req, res) => {
  const { email } = req.body || {}
  if (!email) return res.status(400).json({ error:'email required', code:'BAD_REQUEST' })
  const norm = String(email).trim().toLowerCase()
  const client = await pool.connect()
  let userId: string
  try{
    const r = await client.query(`insert into users(user_id, email) values(gen_random_uuid(), $1) on conflict (email) do update set email=excluded.email returning user_id`, [norm])
    userId = r.rows[0].user_id
  } finally { client.release() }
  const access = signAccessToken(userId)
  const refresh = signRefreshToken(userId)
  res.cookie('rr_refresh', refresh, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict',
    path: '/v1/auth/refresh', maxAge: TTL.REFRESH_TTL_SECONDS * 1000
  })
  upsertUserToSupabase({ user_id: userId, email: norm })
  return res.json({ accessToken: access, expiresIn: TTL.ACCESS_TTL_SECONDS, userId })
})

router.get('/csrf', async (req, res) => {
  const token = setCsrfCookie(req, res)
  res.json({ csrf: token })
})

router.post('/refresh', requireCsrf, async (req, res) => {
  const token = (req as any).cookies?.['rr_refresh']
  if (!token) return res.status(401).json({ error:'No refresh token', code:'NO_REFRESH' })
  try{
    const payload = verifyRefreshToken(token)
    const userId = payload.sub
    const access = signAccessToken(userId)
    const refresh = signRefreshToken(userId)
    res.cookie('rr_refresh', refresh, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict',
      path: '/v1/auth/refresh', maxAge: TTL.REFRESH_TTL_SECONDS * 1000
    })
    return res.json({ accessToken: access, expiresIn: TTL.ACCESS_TTL_SECONDS })
  }catch{
    return res.status(401).json({ error:'Invalid refresh', code:'INVALID_REFRESH' })
  }
})

router.post('/logout', requireCsrf, (req, res) => {
  res.clearCookie('rr_refresh', { path: '/v1/auth/refresh' })
  return res.json({ ok:true })
})

router.get('/me', (req, res) => {
  try{
    const auth = req.headers['authorization'] || ''
    const [scheme, token] = auth.split(' ')
    if (scheme !== 'Bearer' || !token) return res.status(401).json({ error:'Unauthorized', code:'NO_TOKEN' })
    const payload = verifyAccessToken(token)
    const userId = payload.sub
    pool.connect().then(async client=>{
      try{
        const r = await client.query(`select email from users where user_id=$1`, [userId])
        const email = r.rows[0]?.email || null
        return res.json({ userId, email })
      }finally{ client.release() }
    }).catch(()=> res.json({ userId }))
  }catch{ return res.status(401).json({ error:'Unauthorized', code:'INVALID_TOKEN' }) }
})

// Social login (dev): aceita provider e email e reutiliza fluxo de login por email
router.post('/social', async (req, res) => {
  const { provider, email } = req.body || {}
  if (!provider || !email) return res.status(400).json({ error:'provider and email required', code:'BAD_REQUEST' })
  // Em produção, validar id_token do provedor; aqui reusamos fluxo por e-mail
  const norm = String(email).trim().toLowerCase()
  const client = await pool.connect()
  let userId: string
  try{
    const r = await client.query(`insert into users(user_id, email) values(gen_random_uuid(), $1) on conflict (email) do update set email=excluded.email returning user_id`, [norm])
    userId = r.rows[0].user_id
  } finally { client.release() }
  const access = signAccessToken(userId)
  const refresh = signRefreshToken(userId)
  res.cookie('rr_refresh', refresh, { httpOnly:true, secure:process.env.NODE_ENV==='production', sameSite:'strict', path:'/v1/auth/refresh', maxAge: TTL.REFRESH_TTL_SECONDS * 1000 })
  return res.json({ accessToken: access, expiresIn: TTL.ACCESS_TTL_SECONDS, userId, provider })
})

// Login com Google: valida id_token e emite tokens
router.post('/google', socialLimiter, requireCsrf, async (req, res) => {
  try{
    const { idToken } = req.body || {}
    if (!idToken) return res.status(400).json({ error:'idToken required', code:'BAD_REQUEST' })
    const aud = process.env.GOOGLE_CLIENT_ID
    if (!aud) return res.status(500).json({ error:'GOOGLE_CLIENT_ID missing', code:'CONFIG' })
    const r = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`)
    if (!r.ok) return res.status(401).json({ error:'Invalid id_token', code:'INVALID_ID_TOKEN' })
    const info:any = await r.json()
    if (info.aud !== aud) return res.status(401).json({ error:'Audience mismatch', code:'AUD_MISMATCH' })
    const issOk = info.iss === 'accounts.google.com' || info.iss === 'https://accounts.google.com'
    if (!issOk) return res.status(401).json({ error:'Issuer mismatch', code:'ISS_MISMATCH' })
    if (String(info.email_verified) !== 'true') return res.status(401).json({ error:'Email not verified', code:'EMAIL_UNVERIFIED' })
    const email = String(info.email || '').toLowerCase()
    const googleId = String(info.sub)
    if (!email || !googleId) return res.status(401).json({ error:'Missing claims', code:'MISSING_CLAIMS' })
    const client = await pool.connect()
    let userId: string
    try{
      await ensureProvidersTable(client)
      const r2 = await client.query(`insert into users(user_id, email, updated_at) values(gen_random_uuid(), $1, now()) on conflict (email) do update set updated_at=now() returning user_id`, [email])
      userId = r2.rows[0].user_id
      await client.query(`insert into user_providers(user_id, provider, provider_id, updated_at) values($1,'google',$2,now()) on conflict (user_id, provider) do update set provider_id=excluded.provider_id, updated_at=now()`, [userId, googleId])
    } finally { client.release() }
    const access = signAccessToken(userId)
    const refresh = signRefreshToken(userId)
    res.cookie('rr_refresh', refresh, { httpOnly:true, secure:process.env.NODE_ENV==='production', sameSite:'strict', path:'/v1/auth/refresh', maxAge: TTL.REFRESH_TTL_SECONDS * 1000 })
    upsertUserToSupabase({ user_id: userId, email })
    return res.json({ accessToken: access, expiresIn: TTL.ACCESS_TTL_SECONDS, userId, provider:'google' })
  }catch(err){
    return res.status(500).json({ error:'google_login_failed', code:'GOOGLE_LOGIN_ERROR' })
  }
})

async function ensureAuthTable(client: any){
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
}

function scryptHash(password: string, salt: Buffer){
  const key = crypto.scryptSync(password, salt, 64, { N: 1 << 15, r: 8, p: 1 })
  return `scrypt:${salt.toString('hex')}:${key.toString('hex')}`
}

function scryptVerify(password: string, stored: string){
  const parts = stored.split(':')
  if (parts[0] !== 'scrypt') return false
  const salt = Buffer.from(parts[1], 'hex')
  const expect = parts[2]
  const key = crypto.scryptSync(password, salt, 64, { N: 1 << 15, r: 8, p: 1 })
  return crypto.timingSafeEqual(Buffer.from(expect, 'hex'), key)
}

router.post('/register', registerLimiter, requireCsrf, async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error:'email and password required', code:'BAD_REQUEST' })
  const norm = String(email).trim().toLowerCase()
  if (!/.+@.+\..+/.test(norm)) return res.status(400).json({ error:'invalid email', code:'INVALID_EMAIL' })
  if (String(password).length < 12) return res.status(400).json({ error:'weak password', code:'WEAK_PASSWORD' })
  const client = await pool.connect()
  try{
    await ensureAuthTable(client)
    const exists = await client.query(`select user_id from users where email=$1`, [norm])
    if (exists.rows.length){ return res.status(409).json({ error:'email exists', code:'EMAIL_EXISTS' }) }
    const ins = await client.query(`insert into users(user_id, email, updated_at) values(gen_random_uuid(), $1, now()) returning user_id`, [norm])
    const userId = ins.rows[0].user_id
    const salt = crypto.randomBytes(16)
    const ph = scryptHash(String(password), salt)
    await client.query(`insert into users_auth(user_id, password_hash, password_version) values($1,$2,1)`, [userId, ph])
    const access = signAccessToken(userId)
    const refresh = signRefreshToken(userId)
    res.cookie('rr_refresh', refresh, { httpOnly:true, secure:process.env.NODE_ENV==='production', sameSite:'strict', path:'/v1/auth/refresh', maxAge: TTL.REFRESH_TTL_SECONDS * 1000 })
    return res.json({ accessToken: access, expiresIn: TTL.ACCESS_TTL_SECONDS, userId })
  }finally{ client.release() }
})

router.post('/login/password', passwordLimiter, requireCsrf, async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error:'email and password required', code:'BAD_REQUEST' })
  const norm = String(email).trim().toLowerCase()
  const client = await pool.connect()
  try{
    await ensureAuthTable(client)
    const u = await client.query(`select u.user_id, a.password_hash, a.failed_attempts, a.locked_until from users u join users_auth a on a.user_id=u.user_id where u.email=$1`, [norm])
    if (!u.rows.length) return res.status(401).json({ error:'invalid credentials', code:'INVALID_LOGIN' })
    const row = u.rows[0]
    if (row.locked_until && new Date(row.locked_until).getTime() > Date.now()) return res.status(429).json({ error:'locked', code:'ACCOUNT_LOCKED' })
    const ok = scryptVerify(String(password), String(row.password_hash))
    if (!ok){
      const attempts = Number(row.failed_attempts || 0) + 1
      let lockedUntil = null
      if (attempts >= 5){ lockedUntil = new Date(Date.now() + 15 * 60_000).toISOString() }
      await client.query(`update users_auth set failed_attempts=$1, locked_until=$2, updated_at=now() where user_id=$3`, [attempts, lockedUntil, row.user_id])
      return res.status(401).json({ error:'invalid credentials', code:'INVALID_LOGIN' })
    }
    await client.query(`update users_auth set failed_attempts=0, locked_until=null, updated_at=now() where user_id=$1`, [row.user_id])
    const access = signAccessToken(row.user_id)
    const refresh = signRefreshToken(row.user_id)
    res.cookie('rr_refresh', refresh, { httpOnly:true, secure:process.env.NODE_ENV==='production', sameSite:'strict', path:'/v1/auth/refresh', maxAge: TTL.REFRESH_TTL_SECONDS * 1000 })
    return res.json({ accessToken: access, expiresIn: TTL.ACCESS_TTL_SECONDS, userId: row.user_id })
  }finally{ client.release() }
})

export default router
async function ensureProvidersTable(client: any){
  await client.query(`
    create table if not exists user_providers(
      user_id uuid references users(user_id) on delete cascade,
      provider text not null,
      provider_id text not null,
      updated_at timestamptz not null default now(),
      primary key(user_id, provider)
    );
  `)
}