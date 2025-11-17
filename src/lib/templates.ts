export type Modalidade = 'TC' | 'RM' | 'US' | 'RX' | 'Mamografia' | 'Doppler' | 'PET/CT'

export type Template = {
  id: string
  titulo: string
  modalidade: Modalidade
  conteudo: { achados: string; conclusao: string; tecnica?: string; indicacao?: string }
}

export const TEMPLATES: Template[] = [
  {
    id: 'tc-torax-basico',
    titulo: 'TC Tórax – Básico',
    modalidade: 'TC',
    conteudo: {
      achados: 'Parênquima pulmonar analisado em janelas de pulmão e mediastino. Sem consolidações francas. Sem derrame pleural evidente. Linfonodos mediastinais não aumentados aos níveis avaliados.',
      conclusao: 'Sem alterações significativas no estudo tomográfico do tórax.',
      tecnica: 'Tomografia computadorizada do tórax conforme protocolo institucional.',
    },
  },
  {
    id: 'us-abdome',
    titulo: 'US Abdome Superior',
    modalidade: 'US',
    conteudo: {
      achados: 'Fígado de forma e contornos preservados, ecotextura homogênea. Vesícula biliar normodistendida, paredes finas. Vias biliares sem dilatação. Pâncreas e baço sem alterações significativas. Ausência de líquido livre.',
      conclusao: 'Ultrassonografia de abdome superior sem alterações significativas.',
      tecnica: 'Exame realizado com transdutor convexo multifrequencial.',
    },
  },
]

export type Macro = { id: string; chave: string; modalidade?: Modalidade; texto: string }

export const MACROS: Macro[] = [
  { id: 'pulmoes-normais', chave: 'macro pulmões normais', modalidade: 'TC', texto: 'Pulmões com arquitetura preservada, sem consolidações, sem derrames, sem pneumotórax.' },
  { id: 'conclusao-padrao', chave: 'macro conclusão padrão', texto: 'Achados compatíveis com estudo sem alterações significativas.' },
  { id: 'coluna-lombar-normal', chave: 'macro normal coluna lombar', modalidade: 'RM', texto: 'Alinhamento preservado, discos sem protrusões significativas, sinais inflamatórios ausentes.' },
]

export const DEFAULT_SECTIONS = {
  achados: 'Descrever achados relevantes de forma objetiva, com localização e características.',
  conclusao: 'Síntese interpretativa com as principais impressões diagnósticas.'
}