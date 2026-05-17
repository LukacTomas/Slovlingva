import { useState, useRef, useEffect } from 'react'
import './PinInput.css'

interface PinInputProps {
  /** Called when all 4 digits are entered. */
  onComplete: (pin: string) => void
  /** Error message to display (e.g. "Nesprávny PIN"). Clears on next input. */
  error?: string
  /** Whether the input is disabled. */
  disabled?: boolean
  /** Auto-focus the first input on mount. */
  autoFocus?: boolean
}

const PIN_LENGTH = 4

export function PinInput({ onComplete, error, disabled = false, autoFocus = true }: PinInputProps) {
  const [digits, setDigits] = useState<string[]>(Array(PIN_LENGTH).fill(''))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [autoFocus])

  // Clear digits when error changes (user needs to re-enter)
  useEffect(() => {
    if (error) {
      setDigits(Array(PIN_LENGTH).fill(''))
      inputRefs.current[0]?.focus()
    }
  }, [error])

  const handleChange = (index: number, value: string) => {
    // Only accept single digit
    const digit = value.replace(/[^0-9]/g, '').slice(-1)
    const newDigits = [...digits]
    newDigits[index] = digit
    setDigits(newDigits)

    if (digit && index < PIN_LENGTH - 1) {
      // Auto-advance to next input
      inputRefs.current[index + 1]?.focus()
    }

    // Check if all digits filled
    if (digit && newDigits.every(d => d !== '')) {
      onComplete(newDigits.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[index] === '' && index > 0) {
        // Move to previous input on backspace when current is empty
        const newDigits = [...digits]
        newDigits[index - 1] = ''
        setDigits(newDigits)
        inputRefs.current[index - 1]?.focus()
        e.preventDefault()
      } else {
        const newDigits = [...digits]
        newDigits[index] = ''
        setDigits(newDigits)
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, PIN_LENGTH)
    if (pasted.length === PIN_LENGTH) {
      const newDigits = pasted.split('')
      setDigits(newDigits)
      onComplete(pasted)
    }
  }

  return (
    <div className="pin-input">
      <div className="pin-input__digits" role="group" aria-label="Zadaj PIN">
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={el => { inputRefs.current[i] = el }}
            className={`pin-input__digit${error ? ' pin-input__digit--error' : ''}`}
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            onPaste={handlePaste}
            disabled={disabled}
            autoComplete="off"
            aria-label={`PIN číslica ${i + 1}`}
          />
        ))}
      </div>
      {error && (
        <p className="pin-input__error" role="alert">{error}</p>
      )}
    </div>
  )
}
