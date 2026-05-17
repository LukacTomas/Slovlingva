import { useState, useRef, useEffect } from 'react'
import './NumberInput.css'

interface NumberInputProps {
  onSubmit: (answer: number) => void
  disabled?: boolean
  /** Feedback state after submission. */
  lastCorrect?: boolean | null
}

export function NumberInput({ onSubmit, disabled = false, lastCorrect = null }: NumberInputProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus()
    }
  }, [disabled])

  // Reset input when lastCorrect changes to null (new exercise)
  useEffect(() => {
    if (lastCorrect === null) {
      setValue('')
    }
  }, [lastCorrect])

  const handleSubmit = () => {
    const num = parseInt(value, 10)
    if (isNaN(num)) return
    onSubmit(num)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  const stateClass =
    lastCorrect === true
      ? 'number-input--correct'
      : lastCorrect === false
        ? 'number-input--wrong'
        : ''

  return (
    <div className={`number-input ${stateClass}`.trim()}>
      <input
        ref={inputRef}
        className="number-input__field"
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={(e) => setValue(e.target.value.replace(/[^0-9]/g, ''))}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="?"
        autoComplete="off"
        aria-label="Zadaj odpoveď"
      />
      <button
        className="number-input__submit btn btn--primary"
        onClick={handleSubmit}
        disabled={disabled || value === ''}
        aria-label="Potvrdiť odpoveď"
      >
        OK
      </button>
    </div>
  )
}
