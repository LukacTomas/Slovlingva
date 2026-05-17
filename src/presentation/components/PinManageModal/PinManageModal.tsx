import { useState } from 'react'
import './PinManageModal.css'
import { PinInput } from '../PinInput/PinInput'
import { useProfile } from '../../hooks/useProfile'

interface PinManageModalProps {
  onClose: () => void
}

type Step = 'verify-current' | 'enter-new' | 'confirm-new'

export function PinManageModal({ onClose }: PinManageModalProps) {
  const { activeProfile, setPin } = useProfile()
  const hasPin = !!activeProfile?.pinHash

  const [step, setStep] = useState<Step>(hasPin ? 'verify-current' : 'enter-new')
  const [error, setError] = useState('')
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')

  if (!activeProfile) return null

  const handleVerifyCurrent = (pin: string) => {
    setCurrentPin(pin)
    setError('')
    setStep('enter-new')
  }

  const handleEnterNew = (pin: string) => {
    setNewPin(pin)
    setError('')
    setStep('confirm-new')
  }

  const handleConfirmNew = async (pin: string) => {
    if (pin !== newPin) {
      setError('PINy sa nezhodujú')
      return
    }
    try {
      await setPin(activeProfile.id, hasPin ? currentPin : undefined, newPin)
      onClose()
    } catch {
      setError('Nepodarilo sa nastaviť PIN')
    }
  }

  const handleRemove = async () => {
    try {
      await setPin(activeProfile.id, currentPin, null)
      onClose()
    } catch {
      setError('Nesprávny PIN')
      setStep('verify-current')
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  const title = hasPin
    ? step === 'verify-current' ? 'Zadaj aktuálny PIN' : 'Nový PIN'
    : step === 'enter-new' ? 'Nastav PIN' : 'Potvrď PIN'

  const subtitle = step === 'confirm-new' ? 'Zopakuj PIN pre potvrdenie' : undefined

  return (
    <div className="pin-manage-backdrop" onClick={handleBackdropClick} role="dialog" aria-modal="true" aria-label="Správa PIN">
      <div className="pin-manage">
        <h2 className="pin-manage__title">{title}</h2>
        {subtitle && <p className="pin-manage__subtitle">{subtitle}</p>}

        {step === 'verify-current' && (
          <>
            <PinInput onComplete={handleVerifyCurrent} error={error} />
            <div className="pin-manage__actions">
              <button className="btn btn--ghost btn--sm" onClick={handleRemove}>
                Odstrániť PIN
              </button>
            </div>
          </>
        )}

        {step === 'enter-new' && (
          <PinInput onComplete={handleEnterNew} error={error} />
        )}

        {step === 'confirm-new' && (
          <PinInput onComplete={handleConfirmNew} error={error} />
        )}

        <button className="pin-manage__cancel btn btn--ghost" onClick={onClose}>
          Zrušiť
        </button>
      </div>
    </div>
  )
}
