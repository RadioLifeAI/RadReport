import React from 'react'
import { User, Cog, Building, PenTool, CreditCard, History, HelpCircle, LayoutDashboard, LogOut } from 'lucide-react'
import { useSettingsDrawer } from './useSettingsDrawer'
import { dataService } from '../../data/DataService'

export default function SettingsSidebar({ userEmail }: { userEmail: string | null }){
  const { tab, setTab, setOpen } = useSettingsDrawer()
  const Item = ({ t, icon:Icon, label }:{ t:any, icon:any, label:string }) => (
    <button className={`flex w-full items-center gap-2 rounded-md border border-[color:var(--divider)] px-3 py-2 text-left ${tab===t?'bg-white/10':''}`} onClick={()=>setTab(t)}><Icon size={16}/><span>{label}</span></button>
  )
  return (
    <aside className="flex h-full w-60 flex-col gap-3 bg-[color:var(--panel)]/90 p-3">
      <div className="rounded-md border border-[color:var(--divider)] p-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-400/20 text-sm">{(userEmail||'U').slice(0,1).toUpperCase()}</div>
          <div className="text-sm">{userEmail||'Usuário'}</div>
        </div>
      </div>
      <nav className="flex flex-col gap-2">
        {Item({ t:'account', icon:User, label:'Conta' })}
        {Item({ t:'general', icon:Cog, label:'Geral' })}
        {Item({ t:'clinic', icon:Building, label:'Clínica' })}
        {Item({ t:'editor', icon:PenTool, label:'Editor' })}
        {Item({ t:'plans', icon:CreditCard, label:'Planos' })}
        {Item({ t:'history', icon:History, label:'Histórico' })}
        {Item({ t:'help', icon:HelpCircle, label:'Ajuda' })}
        <button className="flex w-full items-center gap-2 rounded-md border border-[color:var(--divider)] px-3 py-2 text-left" onClick={()=>setOpen(false)}><LayoutDashboard size={16}/><span>Ir para Editor</span></button>
        <button className="flex w-full items-center gap-2 rounded-md border border-[color:var(--divider)] px-3 py-2 text-left" onClick={async()=>{ await dataService.logout(); window.location.assign('/login') }}><LogOut size={16}/><span>Sair</span></button>
      </nav>
    </aside>
  )
}