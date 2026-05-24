import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '../../store/authStore'
import { validateUsername } from '../../../infrastructure/firebase/authHelpers'
import './ResetPasswordPage.css'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const resetPassword = useAuthStore(s => s.resetPassword)

  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const usernameErr = validateUsername(username.trim())
    if (usernameErr) {
      setError(usernameErr)
      setLoading(false)
      return
    }

    try {
      await resetPassword(username.trim())
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Obnovenie hesla zlyhalo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="reset-password" data-testid="reset-password-page">
      <div className="reset-password__card">
        <header className="reset-password__header">
          <button
            className="reset-password__back"
            onClick={() => navigate({ to: '/auth/login' })}
             aria-label="Späť"
          >
            &#8592;
          </button>
          <h1 className="reset-password__title">Obnovenie hesla</h1>
        </header>

        {success ? (
          <div className="reset-password__success anim-fade-in">
             <p>E-mail na obnovenie hesla bol odoslaný na adresu rodiča.</p>
             <p className="reset-password__hint">Skontroluj doručenú poštu.</p>
            <button
              className="btn btn--primary"
              onClick={() => navigate({ to: '/auth/login' })}
            >
               Späť na prihlásenie
            </button>
          </div>
        ) : (
          <form className="reset-password__form" onSubmit={handleSubmit}>
             <label className="reset-password__label">
               Používateľské meno
              <input
                className="reset-password__input"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoFocus
                data-testid="reset-username"
              />
            </label>

            {error && (
              <div className="reset-password__error" role="alert" data-testid="auth-error">
                {error}
              </div>
            )}

            <button
              className="btn btn--primary"
              type="submit"
              disabled={loading || !username.trim()}
              data-testid="reset-submit"
            >
               {loading ? 'Odosielam…' : 'Obnoviť heslo'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
