import './AnswerOptions.css'

interface AnswerOptionsProps {
  options: number[]
  onSelect: (answer: number) => void
  disabled?: boolean
  /** The option that was selected (shown highlighted briefly). */
  selectedAnswer?: number | null
  /** Whether the last answer was correct. */
  lastCorrect?: boolean | null
}

export function AnswerOptions({
  options,
  onSelect,
  disabled = false,
  selectedAnswer = null,
  lastCorrect = null,
}: AnswerOptionsProps) {
  return (
    <div
      className="answer-options"
      role="toolbar"
      aria-label="Možnosti odpovede"
      data-testid="answer-options"
    >
      {options.map((opt, i) => {
        const isSelected = selectedAnswer === opt
        const stateClass = isSelected
          ? lastCorrect
            ? 'answer-options__btn--correct'
            : 'answer-options__btn--wrong'
          : ''

        return (
          <button
            key={`${opt}-${i}`}
            className={`answer-options__btn ${stateClass}`.trim()}
            onClick={() => onSelect(opt)}
            disabled={disabled}
            aria-label={`Odpoveď ${opt}`}
            data-testid={`answer-${opt}`}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}
