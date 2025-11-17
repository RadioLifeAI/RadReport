/**
 * Cloudflare Turnstile Server-side Validation Utilities
 * 
 * Utilitários para validar tokens Turnstile no servidor
 * Segue as melhores práticas de segurança da Cloudflare
 */

export interface TurnstileValidationResult {
  success: boolean
  message?: string
  errorCodes?: string[]
  action?: string
  cdata?: string
}

export interface TurnstileVerifyResponse {
  success: boolean
  'error-codes'?: string[]
  action?: string
  cdata?: string
}

/**
 * Valida um token Turnstile com a API da Cloudflare
 * 
 * @param token - Token Turnstile recebido do cliente
 * @param secretKey - Chave secreta do Turnstile (opcional, usa env var)
 * @param remoteIP - IP do cliente para validação adicional (opcional)
 * @returns Resultado da validação
 */
export async function verifyTurnstileToken(
  token: string, 
  secretKey?: string,
  remoteIP?: string
): Promise<TurnstileValidationResult> {
  // Usar chave secreta do ambiente ou parâmetro
  const turnstileSecretKey = secretKey || process.env.TURNSTILE_SECRET_KEY
  
  if (!turnstileSecretKey) {
    console.error('❌ Turnstile secret key não configurada')
    return {
      success: false,
      message: 'Configuração do Turnstile incompleta'
    }
  }

  try {
    // Preparar dados para verificação
    const formData = new URLSearchParams()
    formData.append('secret', turnstileSecretKey)
    formData.append('response', token)
    
    if (remoteIP) {
      formData.append('remoteip', remoteIP)
    }

    console.log('🔍 Enviando token para validação na Cloudflare...', {
      tokenPreview: token.substring(0, 20) + '...',
      hasRemoteIP: !!remoteIP,
      remoteIP: remoteIP ? '***.***.***.***' : undefined
    })

    // Fazer requisição para a API da Cloudflare
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    })

    if (!response.ok) {
      console.error('❌ Erro na resposta da Cloudflare:', response.status, response.statusText)
      return {
        success: false,
        message: `Erro na comunicação com Cloudflare: ${response.status}`
      }
    }

    const data: TurnstileVerifyResponse = await response.json()
    
    console.log('📊 Resposta da Cloudflare:', {
      success: data.success,
      errorCodes: data['error-codes'],
      action: data.action,
      hasCdata: !!data.cdata
    })

    // Mapear códigos de erro para mensagens amigáveis
    const errorMessages: Record<string, string> = {
      'missing-input-secret': 'Chave secreta não fornecida',
      'invalid-input-secret': 'Chave secreta inválida',
      'missing-input-response': 'Token de resposta não fornecido',
      'invalid-input-response': 'Token de resposta inválido ou expirado',
      'bad-request': 'Requisição mal formada',
      'timeout-or-duplicate': 'Token expirado ou duplicado',
      'internal-error': 'Erro interno do servidor'
    }

    if (data.success) {
      return {
        success: true,
        action: data.action,
        cdata: data.cdata
      }
    } else {
      const errorCodes = data['error-codes'] || []
      const messages = errorCodes.map(code => errorMessages[code] || code)
      
      return {
        success: false,
        message: messages.join(', ') || 'Falha na verificação',
        errorCodes
      }
    }

  } catch (error) {
    console.error('💥 Erro ao verificar token Turnstile:', error)
    
    return {
      success: false,
      message: 'Erro ao verificar token de segurança'
    }
  }
}

/**
 * Extrai o IP do cliente da requisição
 * Considera proxies e headers comuns
 */
export function getClientIP(req: any): string | undefined {
  try {
    // Lista de headers que podem conter o IP real do cliente
    const ipHeaders = [
      'x-forwarded-for',
      'x-real-ip', 
      'x-client-ip',
      'cf-connecting-ip',
      'x-forwarded',
      'forwarded-for',
      'forwarded',
      'x-cluster-client-ip'
    ]

    // Procurar IP nos headers
    for (const header of ipHeaders) {
      const value = req.headers[header]
      if (value) {
        // Se for uma lista (x-forwarded-for), pegar o primeiro IP
        const ip = Array.isArray(value) ? value[0] : value
        const cleanIP = ip.split(',')[0].trim()
        
        // Validar formato do IP
        if (isValidIP(cleanIP)) {
          console.log(`📍 IP encontrado no header ${header}: ${cleanIP}`)
          return cleanIP
        }
      }
    }

    // Fallback para req.ip (disponível em Express)
    if (req.ip && isValidIP(req.ip)) {
      console.log(`📍 IP encontrado em req.ip: ${req.ip}`)
      return req.ip
    }

    // Último fallback para connection.remoteAddress
    if (req.connection?.remoteAddress && isValidIP(req.connection.remoteAddress)) {
      console.log(`📍 IP encontrado em connection.remoteAddress: ${req.connection.remoteAddress}`)
      return req.connection.remoteAddress
    }

    console.log('⚠️ Não foi possível determinar o IP do cliente')
    return undefined

  } catch (error) {
    console.error('💥 Erro ao extrair IP do cliente:', error)
    return undefined
  }
}

/**
 * Valida formato básico de um endereço IP
 */
function isValidIP(ip: string): boolean {
  // Regex para IPv4
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  
  // Regex para IPv6 simplificado
  const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip)
}

/**
 * Middleware Express para validação de Turnstile
 * Usa token do header X-Turnstile-Token
 */
export async function validateTurnstileMiddleware(req: any, res: any, next: any) {
  try {
    // Em desenvolvimento, pode bypassar
    if (process.env.NODE_ENV === 'development' && !process.env.FORCE_TURNSTILE_IN_DEV) {
      console.log('🛠️ Bypass Turnstile validation in development mode')
      return next()
    }

    const token = req.headers['x-turnstile-token'] as string
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token Turnstile não fornecido no header X-Turnstile-Token'
      })
    }

    const result = await verifyTurnstileToken(token)
    
    if (result.success) {
      // Armazenar dados da validação para uso posterior
      req.turnstileData = {
        action: result.action,
        cdata: result.cdata,
        validated: true
      }
      next()
    } else {
      res.status(403).json({
        success: false,
        message: result.message || 'Falha na verificação de segurança',
        errorCodes: result.errorCodes
      })
    }

  } catch (error) {
    console.error('💥 Erro no middleware Turnstile:', error)
    res.status(500).json({
      success: false,
      message: 'Erro interno ao validar verificação de segurança'
    })
  }
}