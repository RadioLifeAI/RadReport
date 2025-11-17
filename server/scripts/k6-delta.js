import http from 'k6/http'
import { sleep, check } from 'k6'

export const options = { vus: 50, duration: '60s' }
const BASE = __ENV.BASE_URL || 'http://localhost:8787'

export default function(){
  const body = JSON.stringify({ since: '1970-01-01T00:00:00Z', entities:['templates','smart_sentences','findings'] })
  const res = http.post(`${BASE}/v1/sync/delta`, body, { headers: { 'Content-Type':'application/json' } })
  check(res, { '200': r => r.status === 200 })
  sleep(1)
}