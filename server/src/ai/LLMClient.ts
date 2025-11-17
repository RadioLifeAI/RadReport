type Options = { temperature?: number, timeoutMs?: number }

async function withTimeout<T>(p: Promise<T>, ms = 10000): Promise<T> {
  return await Promise.race([
    p,
    new Promise<T>((_, rej) => setTimeout(() => rej(new Error('LLM timeout')), ms)) as any,
  ])
}

export const LLMClient = {
  async complete(prompt: string, opts: Options = {}) {
    const provider = process.env.AI_PROVIDER || 'mock'
    if (provider === 'mock') {
      // Retorna estrutura básica para facilitar integração
      if (prompt.includes('Saída JSON:')) {
        return JSON.stringify({ suggestions: [{ type: 'phrase', text: 'Achado compatível com estudo sem alterações significativas.' }], conclusion: { text: 'Estudo sem alterações significativas.' } })
      }
      return 'Texto sugerido (mock).'
    }
    // TODO: integrar providers reais (OpenAI/Azure/GCP) conforme ENV
    // Exemplo sketch (não funcional):
    // const resp = await fetch('https://api.openai.com/v1/chat/completions',{ ... })
    // return parse(resp)
    throw new Error('AI provider não configurado')
  }
}