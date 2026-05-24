import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '../../store/authStore'
import { useProfileStore } from '../../store/profileStore'
import './AuthLoginPage.css'

export function AuthLoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore(s => s.login)
  const setActiveProfile = useProfileStore(s => s.setActiveProfile)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const profile = await login(username.trim(), password)
      setActiveProfile(profile)
      navigate({ to: '/dashboard' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Prihlásenie zlyhalo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-login" data-testid="auth-login-page">
      <div className="auth-login__card">
        <h1 className="auth-login__title">Prihlásenie</h1>
        <p className="auth-login__subtitle">Zadaj svoje meno a heslo</p>

        <form className="auth-login__form" onSubmit={handleSubmit}>
          <label className="auth-login__label">
            Používateľské meno
            <input
              className="auth-login__input"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
              data-testid="username-input"
            />
          </label>

          <label className="auth-login__label">
            Heslo
            <input
              className="auth-login__input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              data-testid="password-input"
            />
          </label>

          {error && (
            <div className="auth-login__error" role="alert" data-testid="auth-error">
              {error}
            </div>
          )}

          <button
            className="btn btn--primary auth-login__submit"
            type="submit"
            disabled={loading || !username.trim() || !password}
            data-testid="login-submit"
          >
            {loading ? 'Prihlasujem…' : 'Prihlásiť sa'}
          </button>
        </form>

        <div className="auth-login__links">
          <button
            className="btn btn--ghost auth-login__link"
            onClick={() => navigate({ to: '/auth/reset-password' })}
            data-testid="forgot-password-link"
          >
            Zabudol som heslo
          </button>
          <button
            className="btn btn--ghost auth-login__link"
            onClick={() => navigate({ to: '/auth/register' })}
            data-testid="register-link"
          >
            Vytvoriť účet
          </button>
          <button
            className="btn btn--ghost auth-login__link"
            onClick={() => navigate({ to: '/login' })}
            data-testid="back-to-profiles"
          >
            ← Späť na profily
          </button>
        </div>
      </div>
    </div>
  )
}
