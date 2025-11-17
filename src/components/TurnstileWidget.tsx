import React, { useRef, useEffect } from 'react'
import { Turnstile } from '@marsidev/react-turnstile'

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void
  onError?: (error: string) => void
  onExpire?: () => void
  theme?: 'light' | 'dark' | 'auto'
  size?: 'normal' | 'compact'
  language?: string
  retry?: 'auto' | 'never'
  retryInterval?: number
  refreshExpired?: 'auto' | 'manual' | 'never'
  appearance?: 'always' | 'execute' | 'interaction-only'
}

export default function TurnstileWidget({
  onSuccess,
  onError,
  onExpire,
  theme = 'auto',
  size = 'normal',
  language = 'pt-BR',
  retry = 'auto',
  retryInterval = 2000,
  refreshExpired = 'auto',
  appearance = 'interaction-only'
}: TurnstileWidgetProps) {
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA' // Demo key para desenvolvimento
  const [widgetId, setWidgetId] = React.useState<string | null>(null)

  const handleSuccess = (token: string) => {
    console.log('✅ Turnstile verification success:', token)
    onSuccess(token)
  }

  const handleError = (error: string) => {
    console.error('❌ Turnstile verification error:', error)
    onError?.(error)
  }

  const handleExpire = () => {
    console.warn('⚠️ Turnstile token expired')
    onExpire?.()
  }

  // Verificar se está em modo de desenvolvimento
  const isDevelopment = !import.meta.env.VITE_TURNSTILE_SITE_KEY || import.meta.env.DEV

  if (isDevelopment) {
    console.log('🛠️ Turnstile em modo desenvolvimento - usando demo keys')
  }

  return (
    <div className="turnstile-container">
      <Turnstile
        siteKey={siteKey}
        options={{
          theme,
          size,
          language,
          retry,
          retryInterval,
          refreshExpired,
          appearance,
          // Configurações adicionais para melhor UX
          'error-callback': handleError,
          'expired-callback': handleExpire,
          'timeout': 15000, // 15 segundos timeout
          'response-field': true, // Incluir campo de resposta no formulário
          'response-field-name': 'cf-turnstile-response' // Nome do campo
        }}
        onSuccess={handleSuccess}
        onError={handleError}
        onExpire={handleExpire}
      />
      
      {isDevelopment && (
        <div className="mt-2 text-xs text-yellow-600 bg-yellow-50 border border-yellow-200 rounded p-2">
          ⚠️ Modo desenvolvimento ativado - usando chaves demo do Turnstile
        </div>
      )}
    </div>
  )
}