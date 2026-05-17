import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import './CreateProfilePage.css'
import { useProfile } from '../../hooks/useProfile'
import { AVATARS } from '../../../utils/avatars'
import { PinInput } from '../../components/PinInput/PinInput'

type Step = 'name' | 'pin' | 'pin-confirm'

export function CreateProfilePage() {
  const navigate = useNavigate()
  const { createProfile, selectProfile } = useProfile()

  const [step, setStep] = useState<Step>('name')
  const [name, setName] = useState('')
  const [avatarIndex, setAvatarIndex] = useState(0)
  const [nameError, setNameError] = useState('')
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')

  const handleNameSubmit = () => {
    const trimmed = name.trim()
    if (!trimmed) { setNameError('Zadaj meno'); return }
    if (trimmed.length > 20) { setNameError('Meno je príliš dlhé'); return }
    setStep('pin')
  }

  const handlePinComplete = (enteredPin: string) => {
    setPin(enteredPin)
    setPinError('')
    setStep('pin-confirm')
  }

  const handlePinConfirm = async (confirmPin: string) => {
    if (confirmPin !== pin) {
      setPinError('PINy sa nezhodujú')
      return
    }
    const profile = await createProfile(name.trim(), avatarIndex, pin)
    await selectProfile(profile.id)
    navigate({ to: '/dashboard' })
  }

  return (
    <div className="create-profile" data-testid="create-profile-page">
      <header className="create-profile__header">
        <button
          className="create-profile__back"
          data-testid="create-profile-back"
          onClick={() => step === 'name' ? navigate({ to: '/login' }) : setStep(step === 'pin-confirm' ? 'pin' : 'name')}
          aria-label="Späť"
        >
          &#8592;
        </button>
        <h1 className="create-profile__title">Nový hráč</h1>
      </header>

      <main className="create-profile__main">
        {step === 'name' && (
          <div className="create-profile__step anim-fade-in">
            <div className="create-profile__avatar-grid">
              {AVATARS.map((emoji, idx) => (
                <button
                  key={idx}
                  className={`create-profile__avatar-btn${avatarIndex === idx ? ' create-profile__avatar-btn--selected' : ''}`}
                  data-testid="avatar-btn"
                  onClick={() => setAvatarIndex(idx)}
                  aria-label={`Vybrať avatar ${emoji}`}
                  aria-pressed={avatarIndex === idx}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <div className="create-profile__field">
              <input
                className={`create-profile__input${nameError ? ' create-profile__input--error' : ''}`}
                type="text"
                data-testid="name-input"
                placeholder="Tvoje meno"
                value={name}
                maxLength={20}
                autoFocus
                onChange={(e) => { setName(e.target.value); setNameError('') }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleNameSubmit() }}
                aria-label="Meno hráča"
              />
              {nameError && <p className="create-profile__error">{nameError}</p>}
            </div>

            <button className="btn btn--primary create-profile__next" data-testid="next-btn" onClick={handleNameSubmit}>
              Ďalej
            </button>
          </div>
        )}

        {step === 'pin' && (
          <div className="create-profile__step anim-fade-in" data-testid="step-pin">
            <div className="create-profile__avatar-preview">
              {AVATARS[avatarIndex % AVATARS.length]}
            </div>
            <p className="create-profile__step-label">Nastav si PIN</p>
            <p className="create-profile__step-hint">4-miestny kód na ochranu profilu</p>
            <PinInput onComplete={handlePinComplete} error={pinError} />
          </div>
        )}

        {step === 'pin-confirm' && (
          <div className="create-profile__step anim-fade-in" data-testid="step-pin-confirm">
            <div className="create-profile__avatar-preview">
              {AVATARS[avatarIndex % AVATARS.length]}
            </div>
            <p className="create-profile__step-label">Zopakuj PIN</p>
            <p className="create-profile__step-hint">Pre potvrdenie zadaj PIN ešte raz</p>
            <PinInput onComplete={handlePinConfirm} error={pinError} />
          </div>
        )}
      </main>
    </div>
  )
}
