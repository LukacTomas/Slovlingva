import './ExerciseCard.css'
import type { IExercise, IBlank, ITextPart, CharacterOption } from '../../../domain/entities/exercise.entity'

/* ─── Word-group tokeniser ───────────────────────────────────────────────────
 * Groups consecutive parts that share no whitespace boundary into a single
 * no-break token so that a blank is never visually separated from the letters
 * that surround it in the same word.
 * ─────────────────────────────────────────────────────────────────────────── */
type WordToken  = { kind: 'group'; items: ITextPart[] }
type SpaceToken = { kind: 'space' }
type Token = WordToken | SpaceToken

function buildWordTokens(parts: ITextPart[]): Token[] {
  const tokens: Token[] = []
  let current: ITextPart[] = []

  const flush = () => {
    if (current.length > 0) {
      tokens.push({ kind: 'group', items: [...current] })
      current = []
    }
  }

  for (const part of parts) {
    if (part.type === 'blank') {
      // Blanks always join the current group (they attach to surrounding letters)
      current.push(part)
    } else {
      // Text: split on spaces — each space starts a new group
      const words = (part.content ?? '').split(' ')
      for (let i = 0; i < words.length; i++) {
        if (i > 0) {
          flush()
          tokens.push({ kind: 'space' })
        }
        if (words[i]) {
          current.push({ type: 'text', content: words[i] })
        }
      }
    }
  }

  flush()
  return tokens
}

/* ─── BlankSlot ──────────────────────────────────────────────────────────── */
interface BlankSlotProps {
  blank: IBlank
  selected: boolean
  onClick: () => void
  onDrop: (char: CharacterOption) => void
}

function BlankSlot({ blank, selected, onClick, onDrop }: BlankSlotProps) {
  const stateClass = blank.state !== 'empty' ? ` blank-slot--${blank.state}` : ''
  const selectedClass = selected ? ' blank-slot--selected' : ''

  const label = blank.state === 'correct'
    ? `Správne: ${blank.filledChar}`
    : blank.filledChar
    ? `Vyplnené: ${blank.filledChar}, klikni na zmenu`
    : 'Prázdne miesto, klikni na výber'

  return (
    <span
      className={`blank-slot${stateClass}${selectedClass}`}
      role="button"
      tabIndex={0}
      aria-label={label}
      aria-pressed={selected}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick() }}
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy' }}
      onDrop={(e) => {
        e.preventDefault()
        const char = e.dataTransfer.getData('char') as CharacterOption
        if (char) onDrop(char)
      }}
    >
      {blank.filledChar ?? ''}
    </span>
  )
}

/* ─── ExerciseCard ───────────────────────────────────────────────────────── */
interface ExerciseCardProps {
  exercise: IExercise
  selectedBlankId: string | null
  onBlankClick: (blankId: string) => void
  onBlankDrop: (blankId: string, char: CharacterOption) => void
}

export function ExerciseCard({
  exercise,
  selectedBlankId,
  onBlankClick,
  onBlankDrop,
}: ExerciseCardProps) {
  const isWord = exercise.type === 'word'
  const tokens = buildWordTokens(exercise.parts)

  return (
    <div className={`exercise-card exercise-card--${exercise.type}`}>
      {isWord && (
        <p className="exercise-card__hint">Doplň správne písmeno:</p>
      )}
      {exercise.note && (
        <p className="exercise-card__note" aria-label={`Poznámka: ${exercise.note}`}>
          {exercise.note}
        </p>
      )}
      <div className="exercise-card__text" lang="sk" role="group" aria-label="Cvičenie">
        {tokens.map((token, idx) => {
          if (token.kind === 'space') {
            return (
              <span key={idx} className="exercise-card__space" aria-hidden="true"> </span>
            )
          }

          return (
            <span key={idx} className="exercise-card__word">
              {token.items.map((part, pIdx) => {
                if (part.type === 'text') {
                  return (
                    <span key={pIdx} className="exercise-card__text-segment">
                      {part.content}
                    </span>
                  )
                }
                const blank = exercise.blanks.find(b => b.id === part.blankId)
                if (!blank) return null
                return (
                  <BlankSlot
                    key={blank.id}
                    blank={blank}
                    selected={blank.id === selectedBlankId}
                    onClick={() => onBlankClick(blank.id)}
                    onDrop={(char) => onBlankDrop(blank.id, char)}
                  />
                )
              })}
            </span>
          )
        })}
      </div>
    </div>
  )
}
