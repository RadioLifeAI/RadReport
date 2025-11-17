import React from 'react'

type Tab = 'account'|'general'|'clinic'|'editor'|'plans'|'history'|'help'

type Ctx = { open:boolean, tab:Tab, setOpen:(v:boolean)=>void, setTab:(t:Tab)=>void }
const DrawerCtx = React.createContext<Ctx | null>(null)

export function SettingsDrawerProvider({ children }: { children: React.ReactNode }){
  const [open, setOpen] = React.useState<boolean>(false)
  const [tab, setTab] = React.useState<Tab>('account')
  React.useEffect(()=>{ const v = localStorage.getItem('rr.settings.tab') as Tab | null; if (v) setTab(v) },[])
  React.useEffect(()=>{ localStorage.setItem('rr.settings.tab', tab) },[tab])
  return <DrawerCtx.Provider value={{ open, tab, setOpen, setTab }}>{children}</DrawerCtx.Provider>
}

export function useSettingsDrawer(){
  const ctx = React.useContext(DrawerCtx)
  if (!ctx) throw new Error('SettingsDrawerProvider missing')
  return ctx
}