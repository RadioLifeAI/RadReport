import fetch from 'node-fetch'

export async function upsertUserToSupabase(user: { user_id: string, email: string, name?: string | null, picture?: string | null }){
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) return
  const endpoint = `${url}/rest/v1/users`
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify({ user_id: user.user_id, email: user.email, name: user.name ?? null, picture: user.picture ?? null, updated_at: new Date().toISOString() })
  })
  if (!res.ok) return
}