import http from 'k6/http'
import { sleep, check } from 'k6'

export const options = {
  scenarios: {
    constant: { executor: 'constant-arrival-rate', rate: 500, timeUnit: '1s', duration: '60s', preAllocatedVUs: 200 }
  }
}

const BASE = __ENV.BASE_URL || 'http://localhost:8787'

export default function(){
  const res = http.get(`${BASE}/v1/templates?mod=TC`)
  check(res, { 'status 200': r => r.status === 200 })
  sleep(0.1)
}