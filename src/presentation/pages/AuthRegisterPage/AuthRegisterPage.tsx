import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '../../store/authStore'
import { useProfileStore } from '../../store/profileStore'
import { AVATARS } from '../../../utils/avatars'
import { validateUsername, validatePassword } from '../../../infrastructure/firebase/authHelpers'
import './AuthRegisterPage.css'

type Step = 'credentials' | 'avatar'

export function AuthRegisterPage() {
  const navigate = useNavigate()
  const register = useAuthStore(s => s.register)
  const setActiveProfile = useProfileStore(s => s.setActiveProfile)

  const [step, setStep] = useState<Step>('credentials')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [avatarIndex, setAvatarIndex] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCredentialsNext = () => {
    setError('')

    const usernameErr = validateUsername(username.trim())
    if (usernameErr) { setError(usernameErr); return }

    const passwordErr = validatePassword(password)
    if (passwordErr) { setError(passwordErr); return }

    if (password !== confirmPassword) {
      setError('Heslá sa nezhodujú')
      return
    }

    if (recoveryEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recoveryEmail)) {
      setError('Neplatný formát e-mailu')
      return
    }

    setStep('avatar')
  }

  const handleRegister = async () => {
    setError('')
    setLoading(true)

    try {
      const profile = await register({
        username: username.trim(),
        password,
        avatarIndex,
        recoveryEmail: recoveryEmail.trim() || undefined,
      })
      setActiveProfile(profile)
      navigate({ to: '/dashboard' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registrácia zlyhala')
      setLoading(false)
    }
  }

  return (
    <div className="auth-register" data-testid="auth-register-page">
      <div className="auth-register__card">
        <header className="auth-register__header">
          <button
            className="auth-register__back"
            onClick={() => step === 'credentials' ? navigate({ to: '/login' }) : setStep('credentials')}
             aria-label="Späť"
            data-testid="auth-register-back"
          >
            &#8592;
          </button>
           <h1 className="auth-register__title">Nový účet</h1>
        </header>

        {step === 'credentials' && (
          <div className="auth-register__step anim-fade-in">
            <div className="auth-register__form">
               <label className="auth-register__label">
                Používateľské meno
                <input
                  className="auth-register__input"
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  autoComplete="username"
                  autoFocus
                  placeholder="napr. tomas123"
                  data-testid="reg-username"
                />
              </label>

              <label className="auth-register__label">
                Heslo
                <input
                  className="auth-register__input"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="new-password"
                   placeholder="Aspoň 6 znakov"
                  data-testid="reg-password"
                />
              </label>

              <label className="auth-register__label">
                Zopakuj heslo
                <input
                  className="auth-register__input"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  data-testid="reg-confirm-password"
                />
              </label>

               <label className="auth-register__label">
                E-mail rodiča (voliteľne)
                <input
                  className="auth-register__input"
                  type="email"
                  value={recoveryEmail}
                  onChange={e => setRecoveryEmail(e.target.value)}
                  placeholder="Pre obnovenie hesla"
                  data-testid="reg-recovery-email"
                />
                <span className="auth-register__hint">
                   Ak zabudneš heslo, pošle sa odkaz na obnovenie na tento e-mail.
                 </span>
              </label>
            </div>

            {error && (
              <div className="auth-register__error" role="alert" data-testid="auth-error">
                {error}
              </div>
            )}

            <button
              className="btn btn--primary auth-register__next"
              onClick={handleCredentialsNext}
              data-testid="reg-next"
            >
               Ďalej
            </button>
          </div>
        )}

        {step === 'avatar' && (
          <div className="auth-register__step anim-fade-in">
            <p className="auth-register__step-label">Vyber si avatar</p>

            <div className="auth-register__avatar-grid">
              {AVATARS.map((emoji, idx) => (
                <button
                  key={idx}
                  className={`auth-register__avatar-btn${avatarIndex === idx ? ' auth-register__avatar-btn--selected' : ''}`}
                  onClick={() => setAvatarIndex(idx)}
                   aria-label={`Vybrať avatar ${emoji}`}
                  aria-pressed={avatarIndex === idx}
                  data-testid="avatar-btn"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {error && (
              <div className="auth-register__error" role="alert" data-testid="auth-error">
                {error}
              </div>
            )}

            <button
              className="btn btn--primary auth-register__submit"
              onClick={handleRegister}
              disabled={loading}
              data-testid="reg-submit"
            >
               {loading ? 'Vytváram účet…' : 'Vytvoriť účet'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
