import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Editor from './components/Editor'
import VoiceButton from './components/VoiceButton'
import { MACROS, TEMPLATES, DEFAULT_SECTIONS, Template } from './lib/templates'
import { parseCommand } from './lib/commands'
import { useReportStore } from './store'
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'
import { dataService } from './data/DataService'

export default function EditorApp(){
  const { setContent, content, pushVersion, setModalidade, modalidade, versions } = useReportStore()
  const editorRef = useRef<{ insert: (t: string) => void } | null>(null)

  const [dynTemplates, setDynTemplates] = useState<Template[]>([] as any)

  const insertAtEnd = useCallback((t: string) => {
    const wrapper = document.querySelector('.ProseMirror')
    if (!wrapper) return
    const p = document.createElement('p')
    p.textContent = t
    wrapper.appendChild(p)
    setContent(wrapper.innerHTML)
  }, [setContent])

  const onVoiceText = (t: string) => insertAtEnd(t)
  const onVoiceCommand = (cmd: ReturnType<typeof parseCommand>) => {
    if (!cmd) return
    if (cmd.type === 'insert') insertAtEnd(cmd.payload)
    if (cmd.type === 'template') applyTemplate(cmd.payload as Template)
    if (cmd.type === 'style') restyle(cmd.payload)
    if (cmd.type === 'generate') handleGenerateConclusion()
  }

  function applyTemplate(t: Template){
    setModalidade(t.modalidade)
    const html = `
      <h3>Achados</h3>
      <p>${t.conteudo.achados}</p>
      <h3>Conclusão</h3>
      <p>${t.conteudo.conclusao}</p>`
    setContent(html)
  }

  function newBlank(mod?: string){
    setModalidade(mod || null)
    const html = `
      <h3>Achados</h3>
      <p>${DEFAULT_SECTIONS.achados}</p>
      <h3>Conclusão</h3>
      <p>${DEFAULT_SECTIONS.conclusao}</p>`
    setContent(html)
  }

  async function exportDocx(){
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({ text: `Laudo – ${modalidade ?? 'Modalidade'}`, heading: HeadingLevel.HEADING_2 }),
            ...htmlToParagraphs(content),
          ],
        },
      ],
    })
    const blob = await Packer.toBlob(doc)
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'laudo.docx'
    a.click()
  }

  function htmlToParagraphs(html: string){
    const div = document.createElement('div')
    div.innerHTML = html
    const out: Paragraph[] = []
    div.querySelectorAll('h3,p,li').forEach(node => {
      const text = node.textContent || ''
      if (node.tagName === 'H3') out.push(new Paragraph({ text, heading: HeadingLevel.HEADING_3 }))
      else out.push(new Paragraph({ children: [new TextRun(text)] }))
    })
    return out
  }

  function printPDF(){
    window.print()
  }

  function restyle(style: string){
    const div = document.createElement('div')
    div.innerHTML = content
    const p = Array.from(div.querySelectorAll('p'))
    if (style.includes('objetivo')) p.forEach(el => el.textContent = (el.textContent||'').replace(/\s+/g,' ').replace(/\.$/,'') + '.')
    if (style.includes('expandido')) p.forEach(el => el.textContent = (el.textContent||'') + ' ')
    setContent(div.innerHTML)
  }

  function handleGenerateConclusion(){
    const div = document.createElement('div')
    div.innerHTML = content
    const achadosText = Array.from(div.querySelectorAll('h3 + p'))[0]?.textContent || ''
    const concl = sintetizarConclusaoHeuristica(achadosText)
    const conclNode = Array.from(div.querySelectorAll('h3')).find(h => h.textContent?.toLowerCase().includes('conclus'))
    if (conclNode){
      const p = conclNode.nextElementSibling as HTMLElement | null
      if (p) p.textContent = concl
    }
    setContent(div.innerHTML)
  }

  function sintetizarConclusaoHeuristica(texto: string){
    if (!texto.trim()) return 'Conclusão a critério do radiologista, conforme correlação clínica.'
    if (/sem altera(ções|coes)|sem achados/i.test(texto)) return 'Estudo sem alterações significativas.'
    return 'Achados descritos, correlacionar clinicamente. Recomenda-se acompanhar conforme protocolo.'
  }

  const macros = useMemo(() => MACROS, [])
  const templates = useMemo(() => dynTemplates.length ? dynTemplates : TEMPLATES, [dynTemplates])

  useEffect(() => {
    ;(async () => {
      try{
        await dataService.init()
        await dataService.delta()
        const remote = await dataService.getTemplates()
        const mapped = remote.map((r:any) => ({
          id: r.template_id,
          titulo: r.title || 'Template',
          modalidade: r.modality,
          conteudo: {
            achados: r.structure_json?.sections?.find((s:any)=>/achad/i.test(s.title))?.content || DEFAULT_SECTIONS.achados,
            conclusao: r.structure_json?.sections?.find((s:any)=>/conclus/i.test(s.title))?.content || DEFAULT_SECTIONS.conclusao,
          },
        })) as unknown as Template[]
        if (mapped.length) setDynTemplates(mapped)
      }catch{}
    })()
  }, [])

  return (
    <div className="app">
      <aside className="sidebar">
        <div>
          <div className="title">RadReport AI</div>
          <div className="small">Sem PII • Editor assistido</div>
        </div>
        <div>
          <div className="section-header">Ações</div>
          <div className="twoCol">
            <button className="btn" onClick={()=>newBlank()}>Novo vazio</button>
            <VoiceButton onText={onVoiceText} onCommand={onVoiceCommand} />
          </div>
        </div>
        <div>
          <div className="section-header">Templates</div>
          <div className="list">
            {templates.map(t => (
              <div key={t.id} className="item" onClick={()=>applyTemplate(t)}>
                <div className="title">{t.titulo}</div>
                <div className="small">{t.modalidade}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="section-header">Macros</div>
          <div className="list">
            {macros.map(m => (
              <div key={m.id} className="item" onClick={()=>insertAtEnd(m.texto)}>
                <div className="title">{m.chave}</div>
                <div className="small">{m.modalidade ?? 'Geral'}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="section-header">Versões</div>
          <div className="list">
            {versions.map(v => (
              <div key={v.id} className="item" onClick={()=>setContent(v.content)}>
                <div>{new Date(v.ts).toLocaleString()}</div>
              </div>
            ))}
          </div>
          <button className="btn" onClick={pushVersion}>Salvar versão</button>
        </div>
      </aside>
      <main>
        <Editor onGenerateConclusion={handleGenerateConclusion} />
        <div className="footer">
          <span className="pill">Modalidade: {modalidade ?? '—'}</span>
          <button className="btn" onClick={printPDF}>Imprimir/PDF</button>
          <button className="btn" onClick={exportDocx}>Exportar DOCX</button>
        </div>
      </main>
    </div>
  )
}