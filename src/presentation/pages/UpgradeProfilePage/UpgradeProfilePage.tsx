import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '../../store/authStore'
import { useProfileStore } from '../../store/profileStore'
import { AppToolbar } from '../../components/AppToolbar/AppToolbar'
import { validateUsername, validatePassword } from '../../../infrastructure/firebase/authHelpers'
import { avatarEmoji } from '../../../utils/avatars'
import './UpgradeProfilePage.css'

/**
 * UpgradeProfilePage — allows a local profile to "upgrade" to a Firebase account.
 *
 * The user provides a username + password (and optional recovery email).
 * A Firebase account is created, then local data is migrated to Firestore.
 */
export function UpgradeProfilePage() {
  const navigate = useNavigate()
  const { activeProfile } = useProfileStore()
  const register = useAuthStore(s => s.register)
  const migrateLocalProfile = useAuthStore(s => s.migrateLocalProfile)
  const setActiveProfile = useProfileStore(s => s.setActiveProfile)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!activeProfile) {
    navigate({ to: '/login' })
    return null
  }

  const handleUpgrade = async () => {
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

    setLoading(true)

    try {
      // 1. Create the Firebase account (this also creates a bare Firestore profile)
      await register({
        username: username.trim(),
        password,
        avatarIndex: activeProfile.avatarIndex,
        recoveryEmail: recoveryEmail.trim() || undefined,
      })

      // 2. Migrate local data (XP, levels, skills, etc.) into the new Firestore profile
      const migrated = await migrateLocalProfile(activeProfile.id)

      // 3. Set migrated profile as active
      setActiveProfile(migrated)
      navigate({ to: '/dashboard' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upgrade zlyhal')
      setLoading(false)
    }
  }

  return (
    <div className="upgrade-profile" data-testid="upgrade-profile-page">
      <AppToolbar onBack={() => navigate({ to: '/dashboard' })} />

      <div className="upgrade-profile__content">
        <div className="upgrade-profile__card">
           <h1 className="upgrade-profile__title">Vytvoriť účet</h1>

          <div className="upgrade-profile__profile-preview">
            <span className="upgrade-profile__avatar">
              {avatarEmoji(activeProfile.avatarIndex)}
            </span>
            <span className="upgrade-profile__name">{activeProfile.name}</span>
             <span className="upgrade-profile__hint">
               Tvoj postup (Level {activeProfile.level}, {activeProfile.totalXP} XP) sa zachová.
             </span>
          </div>

          <div className="upgrade-profile__form">
             <label className="upgrade-profile__label">
               Používateľské meno
              <input
                className="upgrade-profile__input"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
                placeholder="napr. tomas123"
                data-testid="upgrade-username"
              />
            </label>

            <label className="upgrade-profile__label">
              Heslo
              <input
                className="upgrade-profile__input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
                 placeholder="Aspoň 6 znakov"
                data-testid="upgrade-password"
              />
            </label>

            <label className="upgrade-profile__label">
              Zopakuj heslo
              <input
                className="upgrade-profile__input"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                data-testid="upgrade-confirm-password"
              />
            </label>

             <label className="upgrade-profile__label">
               E-mail rodiča (voliteľne)
              <input
                className="upgrade-profile__input"
                type="email"
                value={recoveryEmail}
                onChange={e => setRecoveryEmail(e.target.value)}
                placeholder="Pre obnovenie hesla"
                data-testid="upgrade-recovery-email"
              />
               <span className="upgrade-profile__field-hint">
                 Ak zabudneš heslo, pošle sa odkaz na obnovenie na tento e-mail.
               </span>
            </label>
          </div>

          {error && (
            <div className="upgrade-profile__error" role="alert" data-testid="upgrade-error">
              {error}
            </div>
          )}

          <button
            className="btn btn--primary upgrade-profile__submit"
            onClick={handleUpgrade}
            disabled={loading}
            data-testid="upgrade-submit"
          >
             {loading ? 'Vytváram účet…' : 'Vytvoriť účet a synchronizovať'}
          </button>
        </div>
      </div>
    </div>
  )
}
