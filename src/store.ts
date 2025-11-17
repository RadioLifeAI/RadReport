import create from 'zustand'

type Version = { id: string; ts: number; content: string }

type State = {
  modalidade: string | null
  content: string
  versions: Version[]
  setContent: (html: string) => void
  pushVersion: () => void
  setModalidade: (m: string | null) => void
}

const KEY = 'radreport.versions'

function loadVersions(): Version[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}

export const useReportStore = create<State>((set, get) => ({
  modalidade: null,
  content: '',
  versions: loadVersions(),
  setContent: (html) => set({ content: html }),
  pushVersion: () => {
    const v = { id: crypto.randomUUID(), ts: Date.now(), content: get().content }
    const versions = [v, ...get().versions].slice(0, 50)
    localStorage.setItem(KEY, JSON.stringify(versions))
    set({ versions })
  },
  setModalidade: (m) => set({ modalidade: m })
}))