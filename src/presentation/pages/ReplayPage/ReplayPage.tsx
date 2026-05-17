import { useState, useCallback } from 'react'
import './ReplayPage.css'
import { useSessionStore } from '../../store/sessionStore'
import { getRenderer } from '../../registry/exerciseRenderers'
import type { AppPage } from '../../../App'

interface ReplayPageProps {
  onNavigate: (page: AppPage) => void
}

export function ReplayPage({ onNavigate }: ReplayPageProps) {
  const snapshot = useSessionStore(s => s.snapshot)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [srMessage, setSrMessage] = useState('')

  if (!snapshot || snapshot.failedExercises.length === 0) {
    onNavigate('round-end')
    return null
  }

  const { failedExercises, replayExercises, rendererKey } = snapshot
  const Renderer = getRenderer(rendererKey)

  if (!Renderer) {
    // Fallback: skip replay if no renderer registered
    onNavigate('round-end')
    return null
  }

  const totalReplay = failedExercises.length
  const currentExercise = replayExercises[currentIndex]

  const handleCorrect = useCallback(() => {
    const nextIndex = currentIndex + 1
    if (nextIndex >= totalReplay) {
      // All replays done — go to round end
      onNavigate('round-end')
    } else {
      setCurrentIndex(nextIndex)
      setSrMessage(`Správne! Ďalší príklad.`)
    }
  }, [currentIndex, totalReplay, onNavigate])

  const handleWrong = useCallback(() => {
    setSrMessage('Nesprávne. Skús znova.')
  }, [])

  const failRecord = failedExercises[currentIndex]
  const reasonLabel: Record<string, string> = {
    wrong: 'Nesprávne',
    skipped: 'Preskočené',
    timeout: 'Čas vypršal',
    hint: 'Nápoveda',
  }

  return (
    <div className="replay-page">
      {/* Screen-reader live region */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {srMessage}
      </div>

      {/* Top banner */}
      <header className="replay-banner">
        <div className="replay-banner__left">
          <span className="replay-banner__icon" aria-hidden="true">&#x21bb;</span>
          <span className="replay-banner__title">Oprava chyb</span>
        </div>

        <div
          className="replay-progress"
          role="progressbar"
          aria-valuenow={currentIndex}
          aria-valuemin={0}
          aria-valuemax={totalReplay}
          aria-label={`Oprava: ${currentIndex + 1} z ${totalReplay}`}
        >
          {Array.from({ length: totalReplay }).map((_, i) => (
            <span
              key={i}
              className={`replay-progress__dot${
                i < currentIndex ? ' replay-progress__dot--done' :
                i === currentIndex ? ' replay-progress__dot--current' : ''
              }`}
              aria-hidden="true"
            />
          ))}
        </div>

        {failRecord && (
          <span className="replay-banner__reason">
            {reasonLabel[failRecord.reason] ?? failRecord.reason}
          </span>
        )}
      </header>

      {/* Exercise content — rendered by the subject-specific component */}
      <main className="replay-main">
        <Renderer
          key={`replay-${currentIndex}`}
          exercise={currentExercise}
          onCorrect={handleCorrect}
          onWrong={handleWrong}
        />
      </main>
    </div>
  )
}
