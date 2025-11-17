/**
 * Cloudflare Turnstile Server-Side Validation Utility
 * 
 * Valida tokens do Turnstile com a API Siteverify do Cloudflare
 * Documentação: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */

interface TurnstileVerifyResponse {
  success: boolean
  'error-codes'?: string[]
  challenge_ts?: string
  hostname?: string
  action?: string
  cdata?: string
}

interface TurnstileValidationResult {
  success: boolean
  message?: string
  errorCodes?: string[]
}

/**
 * Valida um token do Turnstile com a API Siteverify
 * 
 * @param token - O token retornado pelo widget Turnstile
 * @param secretKey - A chave secreta do seu widget (nunca exponha no cliente!)
 * @param remoteIP - IP opcional do usuário para validação adicional
 * @returns Promise com o resultado da validação
 */
export async function verifyTurnstileToken(
  token: string, 
  secretKey?: string,
  remoteIP?: string
): Promise<TurnstileValidationResult> {
  // Usar chave secreta do ambiente ou parâmetro
  const secret = secretKey || process.env.TURNSTILE_SECRET_KEY
  
  if (!secret) {
    console.error('❌ Turnstile secret key não configurada')
    return {
      success: false,
      message: 'Configuração inválida do servidor'
    }
  }

  // Chave demo para desenvolvimento (sempre retorna sucesso)
  if (secret === '1x0000000000000000000000000000000AA') {
    console.log('🛠️ Usando chave demo do Turnstile - validação bypass')
    return {
      success: true,
      message: 'Validação demo bem-sucedida'
    }
  }

  try {
    // Preparar dados para a API
    const formData = new FormData()
    formData.append('secret', secret)
    formData.append('response', token)
    
    if (remoteIP) {
      formData.append('remoteip', remoteIP)
    }

    console.log('🔍 Validando token Turnstile...')
    
    // Chamar API Siteverify do Cloudflare
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
      headers: {
        'User-Agent': 'RadReport-AI/1.0.0'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: TurnstileVerifyResponse = await response.json()
    
    console.log('📊 Resposta da API Turnstile:', {
      success: data.success,
      hostname: data.hostname,
      challenge_ts: data.challenge_ts,
      action: data.action,
      error_codes: data['error-codes']
    })

    if (data.success) {
      return {
        success: true,
        message: 'Verificação bem-sucedida'
      }
    } else {
      // Mapear códigos de erro para mensagens amigáveis
      const errorMessages = {
        'missing-input-secret': 'Chave secreta não fornecida',
        'invalid-input-secret': 'Chave secreta inválida',
        'missing-input-response': 'Token de resposta não fornecido',
        'invalid-input-response': 'Token de resposta inválido ou expirado',
        'bad-request': 'Requisição inválida',
        'timeout-or-duplicate': 'Token expirado ou duplicado',
        'internal-error': 'Erro interno do servidor'
      }

      const errorCode = data['error-codes']?.[0] || 'unknown-error'
      const userMessage = errorMessages[errorCode as keyof typeof errorMessages] || 'Falha na verificação'

      return {
        success: false,
        message: userMessage,
        errorCodes: data['error-codes']
      }
    }

  } catch (error) {
    console.error('❌ Erro ao validar token Turnstile:', error)
    
    return {
      success: false,
      message: 'Erro de conexão com serviço de verificação'
    }
  }
}

/**
 * Middleware para Express.js que valida tokens Turnstile
 * 
 * @param options Configurações do middleware
 * @returns Express middleware function
 */
export function turnstileMiddleware(options: {
  secretKey?: string
  fieldName?: string
  skipOnDevelopment?: boolean
} = {}) {
  const {
    secretKey,
    fieldName = 'cf-turnstile-response',
    skipOnDevelopment = true
  } = options

  return async (req: any, res: any, next: any) => {
    // Skip em desenvolvimento se configurado
    if (skipOnDevelopment && process.env.NODE_ENV === 'development') {
      console.log('🛠️ Bypass Turnstile em modo desenvolvimento')
      return next()
    }

    const token = req.body?.[fieldName] || req.headers['cf-turnstile-response']
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token de verificação não fornecido'
      })
    }

    const result = await verifyTurnstileToken(token, secretKey)
    
    if (!result.success) {
      return res.status(403).json({
        success: false,
        message: result.message || 'Falha na verificação de segurança',
        errorCodes: result.errorCodes
      })
    }

    // Adicionar informações da verificação ao request
    req.turnstile = {
      verified: true,
      timestamp: new Date().toISOString()
    }

    next()
  }
}

/**
 * Helper para extrair IP do usuário de forma segura
 */
export function getClientIP(req: any): string | undefined {
  const forwarded = req.headers['x-forwarded-for']
  const realIP = req.headers['x-real-ip']
  const remoteAddr = req.connection?.remoteAddress
  
  // Priorizar headers de proxy confiáveis
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return remoteAddr
}