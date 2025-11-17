import jwt from 'jsonwebtoken'

const ACCESS_TTL_SECONDS = 15 * 60
const REFRESH_TTL_SECONDS = 7 * 24 * 3600

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!

export function signAccessToken(userId: string){
  return jwt.sign({ sub: userId }, ACCESS_SECRET, { expiresIn: ACCESS_TTL_SECONDS })
}

export function signRefreshToken(userId: string){
  return jwt.sign({ sub: userId }, REFRESH_SECRET, { expiresIn: REFRESH_TTL_SECONDS })
}

export function verifyAccessToken(token: string){
  return jwt.verify(token, ACCESS_SECRET) as { sub: string; iat: number; exp: number }
}

export function verifyRefreshToken(token: string){
  return jwt.verify(token, REFRESH_SECRET) as { sub: string; iat: number; exp: number }
}

export const TTL = { ACCESS_TTL_SECONDS, REFRESH_TTL_SECONDS }