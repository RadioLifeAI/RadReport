import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'

interface EmailVerificationNoticeProps {
  email: string
  onClose?: () => void
}

export default function EmailVerificationNotice({ email, onClose }: EmailVerificationNoticeProps) {
  const [sending, setSending] = useState(false)

  const resendVerificationEmail = async () => {
    try {
      setSending(true)
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/login?verified=true`
        }
      })

      if (error) throw error

      toast.success('Email de verificação reenviado! Verifique sua caixa de entrada.')
    } catch (error) {
      console.error('Erro ao reenviar email:', error)
      toast.error('Erro ao reenviar email de verificação. Tente novamente.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Verificação de Email Pendente
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Você ainda não verificou seu email <strong>{email}</strong>. 
              Verifique sua caixa de entrada e clique no link de confirmação para acessar todos os recursos.
            </p>
          </div>
          <div className="mt-4">
            <div className="flex space-x-3">
              <button
                onClick={resendVerificationEmail}
                disabled={sending}
                className="bg-yellow-800 text-white px-3 py-2 rounded text-sm font-medium hover:bg-yellow-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? 'Reenviando...' : 'Reenviar Email'}
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="bg-white text-yellow-800 px-3 py-2 rounded text-sm font-medium border border-yellow-300 hover:bg-yellow-50"
                >
                  Entendi
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}