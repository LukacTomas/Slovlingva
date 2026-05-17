import './MathExerciseCard.css'
import type { IMathExercise } from '../../../domain/entities/math-exercise.entity'

type AnswerState = 'empty' | 'correct' | 'wrong'

interface MathExerciseCardProps {
  exercise: IMathExercise
  answerState: AnswerState
  playerAnswer: number | null
}

export function MathExerciseCard({ exercise, answerState, playerAnswer }: MathExerciseCardProps) {
  const answerDisplay = playerAnswer !== null ? String(playerAnswer) : '?'

  const answerSlotClass = [
    'math-card__answer-slot',
    answerState === 'correct' ? 'math-card__answer-slot--correct' : '',
    answerState === 'wrong' ? 'math-card__answer-slot--wrong' : '',
    answerState === 'empty' ? 'math-card__answer-slot--empty' : '',
  ].join(' ').trim()

  return (
    <div className="math-card anim-fade-in">
      <div className="math-card__equation" aria-label={exercise.displayText}>
        <span className="math-card__operand">{exercise.operand1}</span>
        <span className="math-card__operator">{exercise.operator}</span>
        <span className="math-card__operand">{exercise.operand2}</span>
        <span className="math-card__equals">=</span>
        <span className={answerSlotClass} aria-live="polite">
          {answerDisplay}
        </span>
      </div>
    </div>
  )
}
