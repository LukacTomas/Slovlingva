import { useState, useCallback, useEffect } from 'react'
import './MathGamePage.css'
import { useMathGame } from '../../hooks/useMathGame'
import { useProfile } from '../../hooks/useProfile'
import { useTimer } from '../../hooks/useTimer'
import { useSessionStore } from '../../store/sessionStore'
import { Hearts } from '../../components/Hearts/Hearts'
import { LevelBadge } from '../../components/LevelBadge/LevelBadge'
import { MathExerciseCard } from '../../components/MathExerciseCard/MathExerciseCard'
import { AnswerOptions } from '../../components/AnswerOptions/AnswerOptions'
import { NumberInput } from '../../components/NumberInput/NumberInput'
import type { AppPage } from '../../../App'

interface MathGamePageProps {
  onNavigate: (page: AppPage) => void
}

export function MathGamePage({ onNavigate }: MathGamePageProps) {
  const {
    exercises,
    gameState,
    currentExercise,
    submitAnswer,
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
  } = useMathGame()

  const { activeProfile, loadProfiles } = useProfile()
  const [advancing, setAdvancing] = useState(false)
  const [srMessage, setSrMessage] = useState('')
  const [answerState, setAnswerState] = useState<'empty' | 'correct' | 'wrong'>('empty')
  const [playerAnswer, setPlayerAnswer] = useState<number | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null)

  // Reset answer state when exercise changes
  useEffect(() => {
    setAdvancing(false)
    setAnswerState('empty')
    setPlayerAnswer(null)
    setSelectedAnswer(null)
    setLastCorrect(null)
  }, [gameState?.currentExerciseIndex, currentExercise?.id])

  // Navigate away when round ends
  useEffect(() => {
    if (!gameState) return
    if (gameState.status === 'round_end' || gameState.status === 'game_over') {
      void (async () => {
        const result = await finaliseRound(gameState.config.timerEnabled)
        await loadProfiles()

        const failedRecords = getFailedRecords()
        // Build replay exercises with answer mode metadata
        const replayExercises = failedRecords.map(r => ({
          ...exercises[r.exerciseIndex],
          __replayMeta: { answerMode: gameState.config.answerMode },
        }))

        const config = gameState.config
        useSessionStore.getState().endRound({
          subject: 'matematika',
          routes: { setupPage: 'math-setup', gamePage: 'math-game' },
          lastRoundResult: result,
          gameStatus: gameState.status,
          failedExercises: failedRecords,
          replayExercises,
          rendererKey: 'matematika',
          gameConfig: config,
          restartRound: () => startRound(config),
          resetGame,
        })

        onNavigate(failedRecords.length > 0 ? 'replay' : 'round-end')
      })()
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

  const handleAnswer = useCallback((answer: number) => {
    if (!currentExercise || advancing) return

    setPlayerAnswer(answer)
    setSelectedAnswer(answer)
    const { correct } = submitAnswer(currentExercise.id, answer)
    setLastCorrect(correct)

    if (correct) {
      setAnswerState('correct')
      setSrMessage('Správne!')
      setAdvancing(true)
      setTimeout(() => nextExercise(), 800)
    } else {
      setAnswerState('wrong')
      setSrMessage('Nesprávne. Skús znova.')
      loseHeart()
      // Reset after shake animation
      setTimeout(() => {
        setAnswerState('empty')
        setPlayerAnswer(null)
        setSelectedAnswer(null)
        setLastCorrect(null)
      }, 600)
    }
  }, [currentExercise, advancing, submitAnswer, loseHeart, nextExercise])

  const handleHint = useCallback(() => {
    if (!currentExercise || advancing) return
    applyHint(currentExercise.id)
    setPlayerAnswer(currentExercise.correctAnswer)
    setAnswerState('correct')
    setSrMessage('Nápoveda použitá.')
    setAdvancing(true)
    setTimeout(() => nextExercise(), 800)
  }, [currentExercise, advancing, applyHint, nextExercise])

  const handleSkip = useCallback(() => {
    if (advancing) return
    setAdvancing(true)
    setSrMessage('Príklad preskočený.')
    applySkip()
  }, [advancing, applySkip])

  if (!gameState || !currentExercise) {
    return <div className="math-game__loading">Načítavam...</div>
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
  const isChoiceMode = gameState.config.answerMode === 'choice'

  return (
    <div className="math-game">
      {/* Screen-reader live region */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {srMessage}
      </div>
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
      <main className="math-game__main">
        <div className="math-game__exercise-area">
          <MathExerciseCard
            exercise={currentExercise}
            answerState={answerState}
            playerAnswer={playerAnswer}
          />

          {hasHints && answerState === 'empty' && (
            <button
              className="game-hint-btn"
              onClick={handleHint}
              disabled={advancing}
              aria-label={`Nápoveda (zostáva ${gameState.hintsLeft})`}
              title="Odhalí správnu odpoveď"
            >
              💡 {gameState.hintsLeft}
            </button>
          )}
        </div>

        <div className="math-game__answer-area">
          {isChoiceMode ? (
            <AnswerOptions
              options={currentExercise.options}
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
      </main>
    </div>
  )
}
