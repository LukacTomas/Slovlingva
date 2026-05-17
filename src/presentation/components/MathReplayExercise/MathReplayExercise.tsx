import { useState, useCallback, useEffect } from 'react'
import { MathExerciseCard } from '../MathExerciseCard/MathExerciseCard'
import { AnswerOptions } from '../AnswerOptions/AnswerOptions'
import { NumberInput } from '../NumberInput/NumberInput'
import type { IMathExercise, MathAnswerMode } from '../../../domain/entities/math-exercise.entity'
import type { ExerciseRendererProps } from '../../registry/exerciseRenderers'

/**
 * Additional props passed via the exercise object's __replayMeta field.
 * This is a lightweight way to pass answer mode without changing the registry interface.
 */
interface ReplayMathExercise extends IMathExercise {
  __replayMeta?: { answerMode: MathAnswerMode }
}

/**
 * Replay wrapper for Math exercises.
 * Renders MathExerciseCard + AnswerOptions/NumberInput with replay-specific logic:
 * - No hearts lost on wrong answer
 * - Player retries indefinitely until correct
 * - Calls onCorrect when answered correctly
 * - Calls onWrong on each incorrect attempt
 */
export function MathReplayExercise({ exercise: rawExercise, onCorrect, onWrong }: ExerciseRendererProps) {
  const exercise = rawExercise as ReplayMathExercise
  const answerMode = exercise.__replayMeta?.answerMode ?? 'choice'
  const isChoiceMode = answerMode === 'choice'

  const [answerState, setAnswerState] = useState<'empty' | 'correct' | 'wrong'>('empty')
  const [playerAnswer, setPlayerAnswer] = useState<number | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null)
  const [advancing, setAdvancing] = useState(false)

  // Reset state when exercise changes
  useEffect(() => {
    setAnswerState('empty')
    setPlayerAnswer(null)
    setSelectedAnswer(null)
    setLastCorrect(null)
    setAdvancing(false)
  }, [exercise.id])

  const handleAnswer = useCallback((answer: number) => {
    if (advancing) return

    setPlayerAnswer(answer)
    setSelectedAnswer(answer)
    const correct = answer === exercise.correctAnswer
    setLastCorrect(correct)

    if (correct) {
      setAnswerState('correct')
      setAdvancing(true)
      setTimeout(() => onCorrect(), 600)
    } else {
      setAnswerState('wrong')
      onWrong()
      // Reset after shake animation
      setTimeout(() => {
        setAnswerState('empty')
        setPlayerAnswer(null)
        setSelectedAnswer(null)
        setLastCorrect(null)
      }, 600)
    }
  }, [exercise.correctAnswer, advancing, onCorrect, onWrong])

  return (
    <>
      <div className="math-game__exercise-area">
        <MathExerciseCard
          exercise={exercise}
          answerState={answerState}
          playerAnswer={playerAnswer}
        />
      </div>
      <div className="math-game__answer-area">
        {isChoiceMode ? (
          <AnswerOptions
            options={exercise.options}
            onSelect={handleAnswer}
            disabled={advancing}
            selectedAnswer={selectedAnswer}
            lastCorrect={lastCorrect}
          />
        ) : (
          <NumberInput
            onSubmit={handleAnswer}
            disabled={advancing}
            lastCorrect={lastCorrect}
          />
        )}
      </div>
    </>
  )
}
