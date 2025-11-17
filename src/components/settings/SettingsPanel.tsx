import React from 'react'
import { useSettingsDrawer } from './useSettingsDrawer'
import { dataService } from '../../data/DataService'

export default function SettingsPanel(){
  const { tab } = useSettingsDrawer()
  const [prefs, setPrefs] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(false)
  const [email, setEmail] = React.useState<string | null>(null)
  React.useEffect(()=>{ (async()=>{ try{ const me = await dataService.me(); setEmail(me?.email || null) }catch{}; try{ const p = await dataService.getPrefs(); setPrefs(p||{}) }catch{} })() },[])
  const save = async()=>{ setLoading(true); try{ await dataService.savePrefs(prefs||{}); }finally{ setLoading(false) } }
  const Section = ({ title, children }:{ title:string, children:any }) => (
    <div className="rounded-md border border-[color:var(--divider)] p-4"><div className="mb-2 text-sm font-semibold">{title}</div>{children}</div>
  )
  return (
    <div className="flex h-full flex-1 flex-col gap-4 bg-[color:var(--bg)]/60 p-4">
      {tab==='account' && (
        <Section title="Informações da conta">
          <div className="grid gap-3">
            <label className="grid gap-1"><span className="text-sm">Nome</span><input className="rounded-md border border-[color:var(--divider)] bg-black/30 px-3 py-2" value={prefs?.name||''} onChange={e=>setPrefs({ ...prefs, name: e.target.value })} /></label>
            <label className="grid gap-1"><span className="text-sm">Email</span><input className="rounded-md border border-[color:var(--divider)] bg-black/30 px-3 py-2" value={email||''} readOnly /></label>
          </div>
        </Section>
      )}
      {tab==='general' && (
        <Section title="Preferências gerais">
          <div className="grid gap-3">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(prefs?.dark_mode)} onChange={e=>setPrefs({ ...prefs, dark_mode: e.target.checked })} /><span>Tema escuro</span></label>
            <label className="grid gap-1"><span className="text-sm">Idioma</span><select className="rounded-md border border-[color:var(--divider)] bg-black/30 px-3 py-2" value={prefs?.lang||'pt'} onChange={e=>setPrefs({ ...prefs, lang: e.target.value })}><option value="pt">Português</option><option value="en">English</option></select></label>
          </div>
        </Section>
      )}
      {tab==='clinic' && (
        <Section title="Configuração da clínica">
          <div className="grid gap-3">
            <label className="grid gap-1"><span className="text-sm">Nome da clínica</span><input className="rounded-md border border-[color:var(--divider)] bg-black/30 px-3 py-2" value={prefs?.clinic_name||''} onChange={e=>setPrefs({ ...prefs, clinic_name: e.target.value })} /></label>
          </div>
        </Section>
      )}
      {tab==='editor' && (
        <Section title="Ajustes do editor">
          <div className="grid gap-3">
            <label className="grid gap-1"><span className="text-sm">Modalidade padrão</span><select className="rounded-md border border-[color:var(--divider)] bg-black/30 px-3 py-2" value={prefs?.default_modality||'TC'} onChange={e=>setPrefs({ ...prefs, default_modality: e.target.value })}><option>TC</option><option>RM</option><option>RX</option><option>US</option></select></label>
            <label className="grid gap-1"><span className="text-sm">Velocidade da voz</span><input type="number" min={0.5} max={2} step={0.1} className="rounded-md border border-[color:var(--divider)] bg-black/30 px-3 py-2" value={prefs?.voice_rate||1} onChange={e=>setPrefs({ ...prefs, voice_rate: Number(e.target.value) })} /></label>
          </div>
        </Section>
      )}
      {tab==='plans' && (
        <Section title="Planos">
          <div className="text-sm text-muted">Gerencie sua assinatura em breve.</div>
        </Section>
      )}
      {tab==='history' && (
        <Section title="Histórico">
          <div className="text-sm text-muted">Resumo de uso será exibido aqui.</div>
        </Section>
      )}
      {tab==='help' && (
        <Section title="Ajuda">
          <div className="text-sm text-muted">Acesse suporte e tutoriais.</div>
        </Section>
      )}
      <div className="flex gap-2">
        <button className="rounded-md border border-[color:var(--divider)] px-4 py-2" onClick={save} disabled={loading}>{loading? 'Salvando…':'Salvar'}</button>
        <button className="rounded-md border border-[color:var(--divider)] px-4 py-2" onClick={()=>window.location.reload()}>Reverter</button>
      </div>
    </div>
  )
}