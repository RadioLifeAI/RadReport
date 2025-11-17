// Função para testar a configuração de autenticação
export function testAuthConfig() {
  console.log('=== Configuração de Autenticação ===')
  console.log('Origem atual:', window.location.origin)
  console.log('Href atual:', window.location.href)
  console.log('Protocolo:', window.location.protocol)
  console.log('Host:', window.location.host)
  console.log('Porta:', window.location.port)
  
  const expectedCallbackUrl = `${window.location.origin}/auth/callback`
  console.log('URL de callback esperada:', expectedCallbackUrl)
  
  // Verificar variáveis de ambiente
  console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
  console.log('Google Client ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID)
  
  console.log('=== Fim da Configuração ===')
}

// Função para verificar se estamos em desenvolvimento local
export function isLocalDevelopment() {
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
}

// Função para obter a URL de callback correta
export function getCallbackUrl() {
  const base = window.location.origin
  return `${base}/auth/callback`
}