import { createHash } from 'crypto'
export function strongETag(data: any){
  const s = typeof data === 'string' ? data : JSON.stringify(data)
  return '"' + createHash('sha1').update(s).digest('hex') + '"'
}