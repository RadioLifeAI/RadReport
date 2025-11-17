import React, { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import { useReportStore } from '../store'
import EditorAIButton from './EditorAIButton'
import { dataService } from '../data/DataService'
import { insertSuggestion, insertConclusion } from '../editor/commands'
import { SettingsDrawerProvider, useSettingsDrawer } from './settings/useSettingsDrawer'
import SettingsSidebar from './settings/SettingsSidebar'
import SettingsPanel from './settings/SettingsPanel'

type Props = { onGenerateConclusion: () => void }

function EditorInner({ onGenerateConclusion }: Props){
  const { content, setContent } = useReportStore()
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Escreva os Achados e a Conclusão…' }),
    ],
    content,
    onUpdate: ({ editor }) => setContent(editor.getHTML()),
    editorProps: { attributes: { class: 'rte' } },
  })

  useEffect(() => { if (editor && content && editor.getHTML() !== content) editor.commands.setContent(content) }, [content, editor])

  if (!editor) return null

  React.useEffect(() => {
    if (!editor) return
    function onKey(e: KeyboardEvent){
      const mod = (e.ctrlKey || e.metaKey)
      if (mod && e.key.toLowerCase() === 'j' && !e.shiftKey){
        e.preventDefault()
        if (editor) {
          const text = editor.getText().slice(0, 1200)
          const modality = useReportStore.getState().modalidade || 'TC'
          dataService.aiSuggest({ text, modality, topK: 6 }).then(res => {
            const s = res?.suggestions?.[0]?.text; if (s && editor) insertSuggestion(editor, s)
            const concl = res?.conclusion?.text; if (concl && editor) insertConclusion(editor, concl)
          }).catch(()=>{})
        }
      }
      if (mod && e.shiftKey && e.key.toLowerCase() === 'j'){
        e.preventDefault()
        if (editor) {
          const modality = useReportStore.getState().modalidade || 'TC'
          const textPrefix = editor.getText().slice(-400)
          dataService.aiComplete({ textPrefix, modality }).then(res => {
            if (res?.completion && editor) insertConclusion(editor, res.completion)
          }).catch(()=>{})
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [editor])

  const btn = (label: string, action: () => void, active?: boolean) => (
    <button className={"" + (active ? ' active' : '')} onClick={action}>{label}</button>
  )

  const { open, setOpen } = useSettingsDrawer()
  const [userEmail, setUserEmail] = React.useState<string | null>(null)
  React.useEffect(()=>{ (async()=>{ try{ const me = await dataService.me(); setUserEmail(me?.email || null) }catch{} })() },[])
  React.useEffect(()=>{ function onEsc(e:KeyboardEvent){ if(e.key==='Escape') setOpen(false) } document.addEventListener('keydown', onEsc); return ()=>document.removeEventListener('keydown', onEsc) },[setOpen])
  return (
    <div className="editorWrap">
      <div className="toolbar" style={{ display:'flex', alignItems:'center' }}>
        {btn('B', () => editor.chain().focus().toggleBold().run(), editor.isActive('bold'))}
        {btn('I', () => editor.chain().focus().toggleItalic().run(), editor.isActive('italic'))}
        {btn('U', () => editor.chain().focus().toggleUnderline().run(), editor.isActive('underline'))}
        {btn('Lista', () => editor.chain().focus().toggleBulletList().run(), editor.isActive('bulletList'))}
        {btn('Num', () => editor.chain().focus().toggleOrderedList().run(), editor.isActive('orderedList'))}
        {btn('H3', () => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive('heading', { level: 3 }))}
        {btn('Conclusão ▶', onGenerateConclusion)}
        <EditorAIButton editor={editor} />
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8 }}>
          <button className="pill" onClick={()=>setOpen(true)} style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ display:'inline-flex', width:24, height:24, borderRadius:999, alignItems:'center', justifyContent:'center', background:'var(--accent)', color:'#001016' }}>{(userEmail||'U').slice(0,1).toUpperCase()}</span>
            <span>Perfil</span>
          </button>
        </div>
      </div>
      <EditorContent editor={editor} />
      {open && (
        <div className="fixed inset-0 z-50" style={{ display:'grid', gridTemplateColumns:'240px 1fr', background:'rgba(0,0,0,.5)' }} onClick={()=>setOpen(false)}>
          <div onClick={e=>e.stopPropagation()} style={{ display:'contents' }}>
            <SettingsSidebar userEmail={userEmail} />
            <SettingsPanel />
          </div>
        </div>
      )}
    </div>
  )
}

export default function Editor({ onGenerateConclusion }: Props){
  return (
    <SettingsDrawerProvider>
      <EditorInner onGenerateConclusion={onGenerateConclusion} />
    </SettingsDrawerProvider>
  )
}