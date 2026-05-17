import { useState, useCallback, useEffect, useRef } from 'react'
import './GamePage.css'
import { useGame } from '../../hooks/useGame'
import { useProfile } from '../../hooks/useProfile'
import { useTimer } from '../../hooks/useTimer'
import { useSessionStore } from '../../store/sessionStore'
import { Hearts } from '../../components/Hearts/Hearts'
import { LevelBadge } from '../../components/LevelBadge/LevelBadge'
import { TileBar } from '../../components/TileBar/TileBar'
import { ExerciseCard } from '../../components/ExerciseCard/ExerciseCard'
import type { CharacterOption, IExercise } from '../../../domain/entities/exercise.entity'
import type { AppPage } from '../../../App'

interface GamePageProps {
  onNavigate: (page: AppPage) => void
}

export function GamePage({ onNavigate }: GamePageProps) {
  const {
    exercises,
    gameState,
    currentExercise,
    fillBlank,
    resetBlank,
    loseHeart,
    nextExercise,
    finaliseRound,
    tick,
    applyHint,
    applySkip,
    markFailed,
    getFailedRecords,
    startRound,
    resetGame,
  } = useGame()

  const { activeProfile, loadProfiles } = useProfile()
  const [selectedBlankId, setSelectedBlankId] = useState<string | null>(null)
  const [advancing, setAdvancing] = useState(false)
  // Live region message for screen readers
  const [srMessage, setSrMessage] = useState('')
  // Track exercise index we already pre-selected for (avoid double-fire)
  const preselectedForIndex = useRef<number | null>(null)

  // Auto-select first empty blank when exercise changes
  useEffect(() => {
    setAdvancing(false)
    if (!currentExercise) {
      setSelectedBlankId(null)
      return
    }
    const idx = gameState?.currentExerciseIndex ?? 0
    if (preselectedForIndex.current === idx) return
    preselectedForIndex.current = idx
    const firstEmpty = currentExercise.blanks.find(b => b.state === 'empty')
    setSelectedBlankId(firstEmpty?.id ?? null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState?.currentExerciseIndex, currentExercise?.id])

  // Navigate away when round ends
  useEffect(() => {
    if (!gameState) return
    if (gameState.status === 'round_end' || gameState.status === 'game_over') {
      const result = finaliseRound(gameState.config.timerEnabled)
      loadProfiles() // sync Zustand profile store with updated localStorage data

      const failedRecords = getFailedRecords()
      // Build replay exercises: clone failed exercises with blanks reset
      const replayExercises = failedRecords.map(r => {
        const ex = exercises[r.exerciseIndex]
        return {
          ...ex,
          blanks: ex.blanks.map(b => ({ ...b, filledChar: null, state: 'empty' as const })),
        } satisfies IExercise
      })

      const config = gameState.config
      useSessionStore.getState().endRound({
        subject: 'slovencina',
        routes: { setupPage: 'game-setup', gamePage: 'game' },
        lastRoundResult: result,
        gameStatus: gameState.status,
        failedExercises: failedRecords,
        replayExercises,
        rendererKey: 'slovencina',
        gameConfig: config,
        restartRound: () => startRound(config),
        resetGame,
      })

      onNavigate(failedRecords.length > 0 ? 'replay' : 'round-end')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState?.status])

  const timerActive = !!(gameState?.config.timerEnabled && gameState.status === 'playing' && !advancing)

  const handleTimerExpire = useCallback(() => {
    markFailed('timeout')
    loseHeart()
  }, [markFailed, loseHeart])

  useTimer({
    active: timerActive,
    secondsLeft: gameState?.timerSecondsLeft ?? 0,
    onTick: tick,
    onExpire: handleTimerExpire,
  })

  const handleFill = useCallback((blankId: string, char: CharacterOption) => {
    if (!currentExercise || advancing) return

    const { correct, allResolved } = fillBlank(currentExercise.id, blankId, char)

    if (!correct) {
      loseHeart()
      setSrMessage(`Nesprávne. Skús znova.`)
      // Keep current blank selected so the player can immediately retry;
      // re-confirm selection after the shake animation resets the blank
      setTimeout(() => {
        resetBlank(currentExercise.id, blankId)
        setSelectedBlankId(blankId)
      }, 500)
      return
    }

    setSrMessage(`Správne!`)

    if (allResolved) {
      setSelectedBlankId(null)
      setAdvancing(true)
      setTimeout(() => nextExercise(), 800)
    } else {
      // Auto-advance: select the next unfilled blank
      const nextEmpty = currentExercise.blanks.find(
        b => b.id !== blankId && b.state === 'empty'
      )
      setSelectedBlankId(nextEmpty?.id ?? null)
    }
  }, [currentExercise, advancing, fillBlank, loseHeart, resetBlank, nextExercise])

  const handleTileClick = useCallback((char: CharacterOption) => {
    if (selectedBlankId) {
      handleFill(selectedBlankId, char)
    }
  }, [selectedBlankId, handleFill])

  const handleBlankClick = useCallback((blankId: string) => {
    const blank = currentExercise?.blanks.find(b => b.id === blankId)
    if (!blank || blank.state === 'correct') return
    // Toggle: clicking the already-selected blank deselects; clicking another selects it
    setSelectedBlankId(prev => prev === blankId ? null : blankId)
  }, [currentExercise])

  const handleBlankDrop = useCallback((blankId: string, char: CharacterOption) => {
    handleFill(blankId, char)
  }, [handleFill])

  const handleHint = useCallback(() => {
    if (!currentExercise || advancing) return
    // Auto-fill the first non-correct blank
    const target = currentExercise.blanks.find(b => b.state !== 'correct')
    if (!target) return

    const { allResolved } = applyHint(currentExercise.id, target.id)
    setSrMessage(`Nápoveda použitá.`)

    if (allResolved) {
      setSelectedBlankId(null)
      setAdvancing(true)
      setTimeout(() => nextExercise(), 800)
    } else {
      // Auto-advance to the next blank after the hinted one
      const nextEmpty = currentExercise.blanks.find(
        b => b.id !== target.id && b.state === 'empty'
      )
      setSelectedBlankId(nextEmpty?.id ?? null)
    }
  }, [currentExercise, advancing, applyHint, nextExercise])

  const handleSkip = useCallback(() => {
    if (advancing) return
    setAdvancing(true)
    setSrMessage(`Príklad preskočený.`)
    applySkip()
  }, [advancing, applySkip])

  if (!gameState || !currentExercise) {
    return <div className="game-page__loading">Načítavam...</div>
  }

  const totalExercises = exercises.length
  const currentIndex = gameState.currentExerciseIndex
  const isTimerMode = gameState.config.timerEnabled
  const timerPercent = isTimerMode
    ? (gameState.timerSecondsLeft / gameState.config.secondsPerExercise) * 100
    : 0
  const timerWarning = isTimerMode && gameState.timerSecondsLeft <= 5
  const hasHints = gameState.hintsLeft > 0
  const hasSkips = gameState.skipsLeft > 0
  const hasUnfilledBlanks = currentExercise.blanks.some(b => b.state === 'empty')

  return (
    <div className="game-page">
      {/* Screen-reader live region for feedback */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {srMessage}
      </div>

      {/* Progress announcement */}
      <div role="status" aria-live="polite" className="sr-only">
        {`Príklad ${currentIndex + 1} z ${totalExercises}`}
      </div>

      {/* Top bar */}
      <header className="game-top-bar">
        <Hearts hearts={gameState.hearts} max={gameState.config.maxHearts} />

        <div
          className="game-progress"
          role="progressbar"
          aria-valuenow={currentIndex}
          aria-valuemin={0}
          aria-valuemax={totalExercises}
          aria-label={`Postup: ${currentIndex} z ${totalExercises} dokončených`}
        >
          {Array.from({ length: totalExercises }).map((_, i) => (
            <span
              key={i}
              className={`game-progress__dot${
                i < currentIndex ? ' game-progress__dot--done' :
                i === currentIndex ? ' game-progress__dot--current' : ''
              }`}
              aria-hidden="true"
            />
          ))}
        </div>

        <div className="game-top-bar__right">
          {hasSkips && (
            <button
              className="game-skip-btn"
              onClick={handleSkip}
              disabled={advancing}
              aria-label={`Preskočiť príklad (zostáva ${gameState.skipsLeft})`}
              title="Preskočiť bez straty srdca"
            >
              ⏭ {gameState.skipsLeft}
            </button>
          )}
          {isTimerMode ? (
            <div
              className={`game-timer${timerWarning ? ' game-timer--warning' : ''}`}
              role="timer"
              aria-label={`Zostatok času: ${gameState.timerSecondsLeft} sekúnd`}
            >
              <div
                className="game-timer__bar"
                style={{ width: `${timerPercent}%` }}
              />
              <span className="game-timer__value" aria-hidden="true">
                {gameState.timerSecondsLeft}s
              </span>
            </div>
          ) : (
            activeProfile && <LevelBadge level={activeProfile.level} />
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="game-main">
        <div className="game-exercise-area">
          <ExerciseCard
            exercise={currentExercise}
            selectedBlankId={selectedBlankId}
            onBlankClick={handleBlankClick}
            onBlankDrop={handleBlankDrop}
          />

          <div className="game-actions-row">
            {hasHints && (
              <button
                className="game-hint-btn"
                onClick={handleHint}
                disabled={advancing}
                aria-label={`Nápoveda (zostáva ${gameState.hintsLeft})`}
                title="Odhalí správne písmeno"
              >
                💡 {gameState.hintsLeft}
              </button>
            )}
            {!selectedBlankId && hasUnfilledBlanks && (
              <p className="game-hint anim-fade-in" aria-live="polite">
                Klikni na prázdne miesto, potom vyber písmeno
              </p>
            )}
          </div>
        </div>

        <TileBar onTileClick={handleTileClick} disabled={advancing} />
      </main>
    </div>
  )
}
