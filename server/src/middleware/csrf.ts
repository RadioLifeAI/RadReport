import { Request, Response, NextFunction } from 'express'
import crypto from 'crypto'

export function setCsrfCookie(req: Request, res: Response){
  const token = crypto.randomBytes(16).toString('hex')
  res.cookie('rr_csrf', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 7 * 24 * 3600 * 1000,
  })
  return token
}

export function requireCsrf(req: Request, res: Response, next: NextFunction){
  const header = (req.headers['x-csrf-token'] as string) || ''
  const cookie = (req as any).cookies?.['rr_csrf']
  if (!header || !cookie || header !== cookie) return res.status(403).json({ error:'Forbidden', code:'CSRF' })
  next()
}