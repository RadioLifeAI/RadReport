/**
 * RadReport API Server
 * 
 * Servidor Express para endpoints de autenticação e validação
 * Integra com Supabase e Cloudflare Turnstile
 */

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { verifyTurnstileHandler } from './routes/turnstile.js'

// Carregar variáveis de ambiente
dotenv.config()

const app = express()
const PORT = process.env.PORT || 8787

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Configuração do Supabase incompleta')
  console.error('Verifique as variáveis de ambiente:')
  console.error('- VITE_SUPABASE_URL ou SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
})

// Middleware
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [
      'https://radreport.com.br',
      'https://www.radreport.com.br',
      'https://api.radreport.com.br'
    ]
  : [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000'
    ]

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requisições sem origin (ex: mobile apps)
    if (!origin) return callback(null, true)
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      console.warn(`⚠️ CORS bloqueado para origem: ${origin}`)
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Turnstile-Token']
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`)
  next()
})

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// Rotas de autenticação
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, name, turnstileToken } = req.body

    // Validar Turnstile token
    if (process.env.NODE_ENV !== 'development' || process.env.FORCE_TURNSTILE_IN_DEV) {
      if (!turnstileToken) {
        return res.status(400).json({
          success: false,
          message: 'Token de verificação Turnstile é obrigatório'
        })
      }

      // Importar dinamicamente para evitar problemas de importação circular
      const { verifyTurnstileToken } = await import('./utils/turnstile.js')
      const turnstileResult = await verifyTurnstileToken(turnstileToken)
      
      if (!turnstileResult.success) {
        return res.status(403).json({
          success: false,
          message: turnstileResult.message || 'Falha na verificação de segurança'
        })
      }
    }

    // Criar usuário no Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          full_name: name
        },
        emailRedirectTo: `${req.headers.origin}/login?verified=true`
      }
    })

    if (error) {
      console.error('❌ Erro ao criar usuário:', error)
      return res.status(400).json({
        success: false,
        message: error.message || 'Erro ao criar conta'
      })
    }

    console.log('✅ Usuário criado com sucesso:', data.user?.id)
    
    res.json({
      success: true,
      message: 'Conta criada com sucesso! Verifique seu email para confirmar.',
      user: {
        id: data.user?.id,
        email: data.user?.email,
        name: data.user?.user_metadata?.name
      }
    })

  } catch (error) {
    console.error('💥 Erro crítico no registro:', error)
    res.status(500).json({
      success: false,
      message: 'Erro interno ao processar registro'
    })
  }
})

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password, turnstileToken } = req.body

    // Validar Turnstile token em produção
    if (process.env.NODE_ENV !== 'development' || process.env.FORCE_TURNSTILE_IN_DEV) {
      if (!turnstileToken) {
        return res.status(400).json({
          success: false,
          message: 'Token de verificação Turnstile é obrigatório'
        })
      }

      const { verifyTurnstileToken } = await import('./utils/turnstile.js')
      const turnstileResult = await verifyTurnstileToken(turnstileToken)
      
      if (!turnstileResult.success) {
        return res.status(403).json({
          success: false,
          message: turnstileResult.message || 'Falha na verificação de segurança'
        })
      }
    }

    // Autenticar no Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error('❌ Erro ao fazer login:', error)
      return res.status(401).json({
        success: false,
        message: error.message || 'Email ou senha incorretos'
      })
    }

    // Verificar se o email foi confirmado
    if (data.user && !data.user.email_confirmed_at) {
      return res.status(401).json({
        success: false,
        message: 'Por favor, confirme seu email antes de fazer login. Verifique sua caixa de entrada.'
      })
    }

    console.log('✅ Login realizado com sucesso:', data.user?.id)
    
    res.json({
      success: true,
      message: 'Login realizado com sucesso!',
      user: {
        id: data.user?.id,
        email: data.user?.email,
        name: data.user?.user_metadata?.name
      },
      session: {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
        expires_at: data.session?.expires_at
      }
    })

  } catch (error) {
    console.error('💥 Erro crítico no login:', error)
    res.status(500).json({
      success: false,
      message: 'Erro interno ao processar login'
    })
  }
})

// Rotas de validação
app.post('/turnstile/verify', verifyTurnstileHandler)

// Rota protegida de exemplo
app.get('/protected', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token de autenticação necessário'
    })
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido ou expirado'
      })
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name
      }
    })

  } catch (error) {
    console.error('💥 Erro ao validar token:', error)
    res.status(500).json({
      success: false,
      message: 'Erro interno ao validar token'
    })
  }
})

// Rota de verificação de email
app.get('/auth/verify-email', async (req, res) => {
  const { token, type = 'signup' } = req.query

  if (!token || typeof token !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Token de verificação inválido'
    })
  }

  try {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: type as any
    })

    if (error) {
      console.error('❌ Erro ao verificar email:', error)
      return res.status(400).json({
        success: false,
        message: error.message || 'Token de verificação inválido ou expirado'
      })
    }

    res.json({
      success: true,
      message: 'Email verificado com sucesso! Você já pode fazer login.'
    })

  } catch (error) {
    console.error('💥 Erro crítico na verificação de email:', error)
    res.status(500).json({
      success: false,
      message: 'Erro interno ao verificar email'
    })
  }
})

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('💥 Erro não tratado:', err)
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor'
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  })
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 RadReport API Server rodando na porta ${PORT}`)
  console.log(`📍 Health check: http://localhost:${PORT}/health`)
  console.log(`🔧 Ambiente: ${process.env.NODE_ENV || 'development'}`)
  console.log(`📧 Supabase URL: ${supabaseUrl}`)
  console.log(`🔒 Turnstile ${process.env.TURNSTILE_SECRET_KEY ? 'configurado' : 'não configurado'}`)
  console.log(`🌐 CORS permitido para: ${allowedOrigins.join(', ')}`)
  
  if (process.env.NODE_ENV === 'production') {
    console.log(`🌍 Produção configurada para domínio: radreport.com.br`)
  }
})

export default app