import { createClient } from 'redis'

const url = process.env.REDIS_URL
export const redis = url ? createClient({ url }) : null

export async function initRedis(){
  if (!redis) return
  if (!redis.isOpen) await redis.connect()
}

export async function cacheGet(key: string){
  if (!redis) return null
  return await redis.get(key)
}

export async function cacheSet(key: string, value: string, ttlSec: number){
  if (!redis) return
  await redis.set(key, value, { EX: ttlSec })
}

export async function cacheDel(pattern: string){
  if (!redis) return
  const it = redis.scanIterator({ MATCH: pattern, COUNT: 100 })
  for await (const k of it) await redis.del(k as string)
}