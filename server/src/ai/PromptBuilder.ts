export type SuggestContext = {
  modality: string
  organ?: string
  findings: string[]
  userStyle?: any
  passages: string[]
}

export const PromptBuilder = {
  suggestion(ctx: SuggestContext) {
    return [
      'Você é LaudoAI. Formato CBR. PT-BR. Frases curtas. Zero PII. Não invente achados.',
      `Modalidade: ${ctx.modality} | Órgão: ${ctx.organ ?? 'geral'}`,
      `Achados atuais: ${ctx.findings.join('; ') || 'não informados'}`,
      `Preferências: ${JSON.stringify(ctx.userStyle || {})}`,
      'Contexto (passagens curtas):',
      ...ctx.passages.map((p, i) => `[${i + 1}] ${p}`),
      "Saída JSON: { suggestions:[{type:'phrase'|'macro'|'edit', text, rationale?}], conclusion? }",
    ].join('\n')
  },
  complete(prefix: string, modality: string) {
    return [
      'Complete a frase com terminologia radiológica padronizada, PT-BR, objetiva e curta. Zero PII.',
      `Modalidade: ${modality}`,
      `Prefixo: ${prefix}`,
      'Saída: apenas o texto completado.'
    ].join('\n')
  },
  differentials(findings: Array<{ term: string; qualifiers?: string[] }>, modality: string) {
    const f = findings.map(x => x.qualifiers?.length ? `${x.term} (${x.qualifiers.join(',')})` : x.term).join('; ')
    return [
      'Gerar diagnósticos diferenciais plausíveis em PT-BR, curtos, com evidência concisa. Zero PII.',
      `Modalidade: ${modality}. Achados: ${f}.`,
      "Saída JSON: { list:[{diagnosis, evidence?}] }",
    ].join('\n')
  }
}