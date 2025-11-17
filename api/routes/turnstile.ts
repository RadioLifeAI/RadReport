/**
 * Cloudflare Turnstile Validation API Endpoint
 * 
 * Endpoint para validar tokens Turnstile no servidor
 * Protege contra bots e automação maliciosa
 */

import { Request, Response } from 'express'
import { verifyTurnstileToken, getClientIP } from '../utils/turnstile'

/**
 * POST /api/verify-turnstile
 * 
 * Valida um token Turnstile recebido do cliente
 * 
 * Body esperado:
 * {
 *   "token": "0.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
 * }
 */
export async function verifyTurnstileHandler(req: Request, res: Response) {
  try {
    const { token } = req.body
    
    // Validar entrada
    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Token de verificação é obrigatório'
      })
    }

    // Obter IP do cliente para validação adicional
    const clientIP = getClientIP(req)
    
    console.log('🔍 Verificando token Turnstile...', {
      tokenPreview: token.substring(0, 10) + '...',
      clientIP: clientIP || 'não disponível',
      userAgent: req.headers['user-agent']?.substring(0, 50)
    })

    // Validar token com Cloudflare
    const result = await verifyTurnstileToken(token, undefined, clientIP)
    
    if (result.success) {
      console.log('✅ Turnstile verification successful')
      
      return res.status(200).json({
        success: true,
        message: 'Verificação concluída com sucesso',
        timestamp: new Date().toISOString()
      })
    } else {
      console.warn('❌ Turnstile verification failed:', result.message)
      
      return res.status(403).json({
        success: false,
        message: result.message || 'Falha na verificação de segurança',
        errorCodes: result.errorCodes
      })
    }

  } catch (error) {
    console.error('💥 Erro crítico ao verificar Turnstile:', error)
    
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao processar verificação'
    })
  }
}

/**
 * Middleware para validar Turnstile antes de processar requests sensíveis
 */
export function requireTurnstileValidation(req: Request, res: Response, next: any) {
  // Em desenvolvimento, podemos bypassar a validação
  if (process.env.NODE_ENV === 'development' && !process.env.FORCE_TURNSTILE_IN_DEV) {
    console.log('🛠️ Bypass Turnstile validation in development mode')
    return next()
  }

  // Verificar se há token no header ou body
  const token = req.headers['x-turnstile-token'] as string || req.body?.turnstileToken
  
  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Token de verificação Turnstile é obrigatório'
    })
  }

  // Armazenar token para validação posterior
  req.turnstileToken = token
  
  // A validação real será feita no handler específico
  next()
}

/**
 * Validação completa com token armazenado
 */
export async function validateStoredTurnstileToken(req: Request): Promise<boolean> {
  const token = req.turnstileToken
  
  if (!token) {
    throw new Error('Token Turnstile não encontrado na requisição')
  }

  const result = await verifyTurnstileToken(token)
  
  return result.success
}