import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL
export const pool = new Pool({ connectionString, max: 10 })

export async function withUser<T>(userId: string | null, fn: (client: any) => Promise<T>) {
  const client = await pool.connect()
  try {
    if (userId) await client.query(`set local app.user_id = $1`, [userId])
    const res = await fn(client)
    return res
  } finally {
    client.release()
  }
}