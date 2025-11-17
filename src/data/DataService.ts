type Entity = 'templates'|'smart_sentences'|'findings'

type TemplateDTO = { template_id:string; title:string; modality:string; structure_json:any; version:number; updated_at:string }
type SentenceDTO = { frase_id:string; modality:string|null; text:string; variables?:any; tags?:string[] }

import { useToast } from '../components/Toast'

let ACCESS_TOKEN: string | null = null
export function setAccessToken(tok: string | null){ ACCESS_TOKEN = tok }
export function getAccessToken(){ return ACCESS_TOKEN }

class DataService {
  base = (import.meta as any).env?.VITE_API_BASE || '/v1'
  googleEnabled = String((import.meta as any).env?.VITE_GOOGLE_AUTH_ENABLED ?? 'true') !== 'false'
  supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://gxhbdbovixbptrjrcwbr.supabase.co'
  supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4aGJkYm92aXhicHRyanJjd2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMzY3MzgsImV4cCI6MjA3ODcxMjczOH0.S4-5DqCkTdT4_j7ZGfwulMHwgIXG_9g1CtahY6qi50Q'
  db!: IDBDatabase
  etags = new Map<string,string>()
  lastSync = localStorage.getItem('rr.lastSync') || '1970-01-01T00:00:00Z'
  usageQueue: any[] = []

  async init(){
    this.db = await this.openDB('radreport', 1, db => {
      if (!db.objectStoreNames.contains('templates')) db.createObjectStore('templates', { keyPath:'template_id' })
      if (!db.objectStoreNames.contains('sentences')) db.createObjectStore('sentences', { keyPath:'frase_id' })
      if (!db.objectStoreNames.contains('findings')) db.createObjectStore('findings', { keyPath:'finding_id' })
      if (!db.objectStoreNames.contains('prefs')) db.createObjectStore('prefs', { keyPath:'user_id' })
    })
    window.addEventListener('online', () => this.flushUsage())
  }

  private openDB(name:string, ver:number, upgrade:(db:IDBDatabase)=>void){
    return new Promise<IDBDatabase>((res, rej) => {
      const req = indexedDB.open(name, ver)
      req.onupgradeneeded = () => upgrade(req.result)
      req.onsuccess = () => res(req.result)
      req.onerror = () => rej(req.error)
    })
  }

  private async fetchJSON(path:string, init?:RequestInit){
    const url = `${this.base}${path}`
    const headers:any = { 'Accept':'application/json' }
    if (ACCESS_TOKEN) headers['Authorization'] = `Bearer ${ACCESS_TOKEN}`
    const et = this.etags.get(url)
    if (et) headers['If-None-Match'] = et
    let resp = await fetch(url, { ...init, headers, credentials:'include' })
    if (resp.status === 401 && path !== '/auth/refresh'){
      try{
        const r = await fetch(`${this.base}/auth/refresh`, { method:'POST', credentials:'include' })
        if (r.ok){
          const j = await r.json(); if (j?.accessToken) ACCESS_TOKEN = j.accessToken
          // retry original
          resp = await fetch(url, { ...init, headers, credentials:'include' })
        }
      }catch{}
    }
    if (resp.status === 304) return { fromCache:true }
    if (!resp.ok) throw new Error(String(resp.status))
    const tag = resp.headers.get('ETag'); if (tag) this.etags.set(url, tag)
    return await resp.json()
  }

  private store(store:string, mode:IDBTransactionMode){ return this.db.transaction(store, mode).objectStore(store) }
  private getAll(store:string){ return new Promise<any[]>((res)=>{ const r=this.store(store,'readonly').getAll(); r.onsuccess=()=>res(r.result) }) }
  private putMany(store:string, rows:any[]){ return new Promise<void>((res)=>{ const s=this.store(store,'readwrite'); rows.forEach(r=>s.put(r)); s.transaction.oncomplete=()=>res() }) }

  async getTemplates(mod?:string): Promise<TemplateDTO[]>{
    try{
      const qs = mod ? `?mod=${encodeURIComponent(mod)}` : ''
      const data:any = await this.fetchJSON(`/templates${qs}`)
      if (data?.data) await this.putMany('templates', data.data)
    }catch{}
    return await this.getAll('templates')
  }

  async getSentences(mod?:string): Promise<SentenceDTO[]>{
    try{
      const qs = mod ? `?mod=${encodeURIComponent(mod)}` : ''
      const data:any = await this.fetchJSON(`/sentences${qs}`)
      if (data?.data) await this.putMany('sentences', data.data)
    }catch{}
    return await this.getAll('sentences')
  }

  async login(email: string){
    const json:any = await this.fetchJSON(`/auth/login`, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ email }) })
    if (json?.accessToken) ACCESS_TOKEN = json.accessToken
    return json
  }

  async loginWithGoogleIdToken(idToken: string){
    const csrf = localStorage.getItem('rr.csrf')
    if (!csrf){ try{ const c:any = await this.fetchJSON(`/auth/csrf`); const t = c?.csrf || c?.data?.csrf; if (t) localStorage.setItem('rr.csrf', t) }catch{} }
    const headers:any = { 'Content-Type':'application/json' }
    const tok = localStorage.getItem('rr.csrf'); if (tok) headers['X-CSRF-Token'] = tok
    const json:any = await this.fetchJSON(`/auth/google`, { method:'POST', headers, body: JSON.stringify({ idToken }) })
    if (json?.accessToken) ACCESS_TOKEN = json.accessToken
    return json
  }

  async register(p: { email: string, password: string }){
    const csrf = localStorage.getItem('rr.csrf')
    if (!csrf){ try{ const c:any = await this.fetchJSON(`/auth/csrf`); const t = c?.csrf || c?.data?.csrf; if (t) localStorage.setItem('rr.csrf', t) }catch{} }
    const headers:any = { 'Content-Type':'application/json' }
    const tok = localStorage.getItem('rr.csrf'); if (tok) headers['X-CSRF-Token'] = tok
    const json:any = await this.fetchJSON(`/auth/register`, { method:'POST', headers, body: JSON.stringify(p) })
    if (json?.accessToken) ACCESS_TOKEN = json.accessToken
    return json
  }

  async loginPassword(p: { email: string, password: string }){
    const csrf = localStorage.getItem('rr.csrf')
    if (!csrf){ try{ const c:any = await this.fetchJSON(`/auth/csrf`); const t = c?.csrf || c?.data?.csrf; if (t) localStorage.setItem('rr.csrf', t) }catch{} }
    const headers:any = { 'Content-Type':'application/json' }
    const tok = localStorage.getItem('rr.csrf'); if (tok) headers['X-CSRF-Token'] = tok
    const json:any = await this.fetchJSON(`/auth/login/password`, { method:'POST', headers, body: JSON.stringify(p) })
    if (json?.accessToken) ACCESS_TOKEN = json.accessToken
    return json
  }

  getGoogleClientId(): string | null {
    const fromEnv = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || null
    const fromLS = localStorage.getItem('rr.google.cid')
    return (fromEnv || fromLS) || null
  }

  async me(){
    const json:any = await this.fetchJSON(`/auth/me`)
    return json
  }

  async pushOps(ops: any[]){
    const json:any = await this.fetchJSON(`/sync/push`, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ ops }) })
    return json
  }

  async pullChanges(since: string){
    const url = `/sync/pull?since=${encodeURIComponent(since || '1970-01-01T00:00:00Z')}`
    const json:any = await this.fetchJSON(url)
    return json
  }

  scheduleSync(){
    window.addEventListener('online', async ()=>{
      try{
        const p = await this.pullChanges(localStorage.getItem('rr.lastSync') || '1970-01-01T00:00:00Z')
        if (p?.nextSince) localStorage.setItem('rr.lastSync', p.nextSince)
      }catch{}
    })
  }

  async getPrefs(){
    const json:any = await this.fetchJSON(`/prefs`)
    return json?.data
  }

  async savePrefs(prefs:any){
    const json:any = await this.fetchJSON(`/prefs`, { method:'PUT', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(prefs) })
    return json?.data
  }

  async logout(){
    const csrf = localStorage.getItem('rr.csrf')
    if (!csrf){ try{ const c:any = await this.fetchJSON(`/auth/csrf`); const t = c?.csrf || c?.data?.csrf; if (t) localStorage.setItem('rr.csrf', t) }catch{} }
    const headers:any = { 'Content-Type':'application/json' }
    const tok = localStorage.getItem('rr.csrf'); if (tok) headers['X-CSRF-Token'] = tok
    try{ await this.fetchJSON(`/auth/logout`, { method:'POST', headers }) }catch{}
    ACCESS_TOKEN = null
  }

  async aiSuggest(p: { text: string, modality: string, organ?: string, topK?: number }){
    const json:any = await this.fetchJSON(`/ai/suggest`, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(p) })
    return json?.data
  }

  async aiComplete(p: { textPrefix: string, modality: string }){
    const json:any = await this.fetchJSON(`/ai/complete`, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(p) })
    return json?.data
  }

  async aiDifferentials(p: { findings: Array<{ term:string, qualifiers?: string[] }>, modality: string }){
    const json:any = await this.fetchJSON(`/ai/differentials`, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(p) })
    return json?.data
  }

  async aiRagSearch(p: { q: string, modality: string, k?: number }){
    const q = new URLSearchParams({ q: p.q, mod: p.modality, k: String(p.k ?? 6) }).toString()
    const json:any = await this.fetchJSON(`/ai/rag/search?`+q)
    return json?.data
  }
  async delta(entities:Entity[]=['templates','smart_sentences','findings']){
    try{
      const body = { since: this.lastSync, entities }
      const data:any = await this.fetchJSON(`/sync/delta`, { method:'POST', body: JSON.stringify(body), headers:{ 'Content-Type':'application/json' } })
      const ch = data?.changes || []
      const del = data?.deleted || []
      for (const c of ch){
        if (c.entity==='templates') await this.putMany('templates', [c])
        if (c.entity==='smart_sentences') await this.putMany('sentences', [c])
        if (c.entity==='findings') await this.putMany('findings', [c])
      }
      this.lastSync = data?.nextSince || new Date().toISOString()
      localStorage.setItem('rr.lastSync', this.lastSync)
    }catch{}
  }

  async postUsage(evt:any){
    try{ await this.fetchJSON(`/usage`, { method:'POST', body: JSON.stringify(evt), headers:{ 'Content-Type':'application/json', 'X-User-Id': localStorage.getItem('rr.user') || '00000000-0000-0000-0000-000000000000' } }) }
    catch{ this.usageQueue.push(evt) }
  }

  private async flushUsage(){
    while(this.usageQueue.length){ const e=this.usageQueue[0]; try{ await this.postUsage(e); this.usageQueue.shift() }catch{ break } }
  }
}

export const dataService = new DataService()