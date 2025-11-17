import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt.js'

export interface AuthRequest extends Request { user?: { id: string } }

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction){
  try{
    const auth = req.headers['authorization'] || ''
    const [scheme, token] = auth.split(' ')
    if (scheme !== 'Bearer' || !token) return res.status(401).json({ error:'Unauthorized', code:'NO_TOKEN' })
    const payload = verifyAccessToken(token)
    req.user = { id: payload.sub }
    next()
  }catch(err){
    return res.status(401).json({ error:'Unauthorized', code:'INVALID_TOKEN' })
  }
}