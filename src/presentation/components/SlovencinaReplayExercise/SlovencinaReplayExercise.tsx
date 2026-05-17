import { useState, useCallback, useEffect, useRef } from 'react'
import { ExerciseCard } from '../ExerciseCard/ExerciseCard'
import { TileBar } from '../TileBar/TileBar'
import type { IExercise, IBlank, CharacterOption } from '../../../domain/entities/exercise.entity'
import type { ExerciseRendererProps } from '../../registry/exerciseRenderers'

/**
 * Replay wrapper for Slovenčina exercises.
 * Renders ExerciseCard + TileBar with replay-specific logic:
 * - No hearts lost on wrong answer
 * - Blanks reset on wrong, player retries indefinitely
 * - Calls onCorrect when all blanks are filled correctly
 * - Calls onWrong on each incorrect attempt (for shake animation, etc.)
 */
export function SlovencinaReplayExercise({ exercise: rawExercise, onCorrect, onWrong }: ExerciseRendererProps) {
  const originalExercise = rawExercise as IExercise

  // Local copy of blanks so we can reset them without touching the store
  const [blanks, setBlanks] = useState<IBlank[]>(() =>
    originalExercise.blanks.map(b => ({ ...b, filledChar: null, state: 'empty' as const }))
  )
  const [selectedBlankId, setSelectedBlankId] = useState<string | null>(null)
  const preselectedRef = useRef(false)

  // Build a local exercise object with our mutable blanks
  const exercise: IExercise = { ...originalExercise, blanks }

  // Auto-select first empty blank on mount
  useEffect(() => {
    if (preselectedRef.current) return
    preselectedRef.current = true
    const firstEmpty = blanks.find(b => b.state === 'empty')
    setSelectedBlankId(firstEmpty?.id ?? null)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleBlankClick = useCallback((blankId: string) => {
    const blank = blanks.find(b => b.id === blankId)
    if (!blank || blank.state === 'correct') return
    setSelectedBlankId(prev => prev === blankId ? null : blankId)
  }, [blanks])

  const handleFill = useCallback((blankId: string, char: CharacterOption) => {
    const blank = blanks.find(b => b.id === blankId)
    if (!blank || blank.state === 'correct') return

    const correct = char === blank.correctChar

    if (correct) {
      const updatedBlanks = blanks.map(b =>
        b.id === blankId ? { ...b, filledChar: char, state: 'correct' as const } : b
      )
      setBlanks(updatedBlanks)

      const allResolved = updatedBlanks.every(b => b.state === 'correct')
      if (allResolved) {
        setSelectedBlankId(null)
        // Small delay so the player sees the final correct state
        setTimeout(() => onCorrect(), 600)
      } else {
        // Auto-advance to next empty blank
        const nextEmpty = updatedBlanks.find(b => b.id !== blankId && b.state === 'empty')
        setSelectedBlankId(nextEmpty?.id ?? null)
      }
    } else {
      // Wrong answer: mark wrong briefly, then reset
      setBlanks(prev => prev.map(b =>
        b.id === blankId ? { ...b, filledChar: char, state: 'wrong' as const } : b
      ))
      onWrong()
      setTimeout(() => {
        setBlanks(prev => prev.map(b =>
          b.id === blankId ? { ...b, filledChar: null, state: 'empty' as const } : b
        ))
        setSelectedBlankId(blankId)
      }, 500)
    }
  }, [blanks, onCorrect, onWrong])

  const handleTileClick = useCallback((char: CharacterOption) => {
    if (selectedBlankId) {
      handleFill(selectedBlankId, char)
    }
  }, [selectedBlankId, handleFill])

  const handleBlankDrop = useCallback((blankId: string, char: CharacterOption) => {
    handleFill(blankId, char)
  }, [handleFill])

  return (
    <>
      <div className="game-exercise-area">
        <ExerciseCard
          exercise={exercise}
          selectedBlankId={selectedBlankId}
          onBlankClick={handleBlankClick}
          onBlankDrop={handleBlankDrop}
        />
      </div>
      <TileBar onTileClick={handleTileClick} disabled={false} />
    </>
  )
}
