import React, { useState } from 'react'
import { Editor } from '@tiptap/react'
import { useReportStore } from '../store'
import { dataService } from '../data/DataService'
import { insertSuggestion, insertConclusion } from '../editor/commands'

export default function EditorAIButton({ editor }: { editor: Editor | null }){
  const { modalidade } = useReportStore()
  const [loading, setLoading] = useState(false)

  async function suggest(){
    if (!editor) return
    setLoading(true)
    try{
      const text = editor.getText().slice(0, 1200)
      const res = await dataService.aiSuggest({ text, modality: modalidade || 'TC', topK: 6 })
      const s = res?.suggestions?.[0]?.text
      if (s) insertSuggestion(editor, s)
      const concl = res?.conclusion?.text
      if (concl) insertConclusion(editor, concl)
    } finally { setLoading(false) }
  }

  async function generateConclusion(){
    if (!editor) return
    setLoading(true)
    try{
      const textPrefix = editor.getText().slice(-400)
      const res = await dataService.aiComplete({ textPrefix, modality: modalidade || 'TC' })
      if (res?.completion) insertConclusion(editor, res.completion)
    } finally { setLoading(false) }
  }

  return (
    <div style={{ display:'inline-flex', gap:8 }}>
      <button className="btn" onClick={suggest} disabled={loading} title="Ctrl+J">
        {loading? 'IA…' : 'IA Sugerir'}
      </button>
      <button className="btn" onClick={generateConclusion} disabled={loading} title="Ctrl+Shift+J">Conclusão IA</button>
    </div>
  )
}