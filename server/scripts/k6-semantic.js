import http from 'k6/http'
import { sleep, check } from 'k6'

export const options = { vus: 30, duration: '60s' }
const BASE = __ENV.BASE_URL || 'http://localhost:8787'

function dummyVec(n){ const a = []; for(let i=0;i<n;i++) a.push(Math.random()); return a }

export default function(){
  const body = JSON.stringify({ vector: dummyVec(1536), mod: 'TC', k: 20 })
  const res = http.post(`${BASE}/v1/findings/semantic`, body, { headers: { 'Content-Type':'application/json' } })
  check(res, { '200': r => r.status === 200 })
  sleep(1)
}