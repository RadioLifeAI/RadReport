import { Editor } from '@tiptap/react'

export function insertSuggestion(editor: Editor, text: string){
  editor.chain().focus().insertContent(text + '\n').run()
}

export function insertConclusion(editor: Editor, text: string){
  editor.chain().focus().insertContent('<h3>Conclusão</h3>\n<p>'+text+'</p>').run()
}

export function expandCurrentSentence(editor: Editor, text: string){
  editor.chain().focus().insertContent(text).run()
}

export function applyTemplate(editor: Editor, html: string){
  editor.commands.setContent(html)
}

export function voiceInsert(editor: Editor, text: string){
  editor.chain().focus().insertContent(text + ' ').run()
}