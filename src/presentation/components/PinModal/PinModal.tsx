import { useState } from 'react'
import './PinModal.css'
import { PinInput } from '../PinInput/PinInput'
import { verifyPin } from '../../../utils/pinUtils'

interface PinModalProps {
  /** The display name shown in the modal header. */
  profileName: string
  /** The avatar emoji. */
  avatar: string
  /** The stored hash to verify against. */
  pinHash: string
  /** Called when PIN is verified successfully. */
  onSuccess: () => void
  /** Called when user cancels. */
  onCancel: () => void
}

export function PinModal({ profileName, avatar, pinHash, onSuccess, onCancel }: PinModalProps) {
  const [error, setError] = useState('')

  const handleComplete = (pin: string) => {
    if (verifyPin(pin, pinHash)) {
      onSuccess()
    } else {
      setError('Nesprávny PIN')
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel()
    }
  }

  return (
    <div className="pin-modal-backdrop" onClick={handleBackdropClick} role="dialog" aria-modal="true" aria-label="Zadaj PIN">
      <div className="pin-modal">
        <div className="pin-modal__avatar">{avatar}</div>
        <h2 className="pin-modal__title">{profileName}</h2>
        <p className="pin-modal__subtitle">Zadaj 4-miestny PIN</p>

        <PinInput onComplete={handleComplete} error={error} />

        <button
          className="pin-modal__cancel btn btn--ghost"
          onClick={onCancel}
        >
          Zrušiť
        </button>
      </div>
    </div>
  )
}
