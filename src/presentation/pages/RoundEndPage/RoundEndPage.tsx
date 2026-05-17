import { useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import './RoundEndPage.css'
import { useSessionStore } from '../../store/sessionStore'
import { useProfile } from '../../hooks/useProfile'
import { AppToolbar } from '../../components/AppToolbar/AppToolbar'

function AccuracyStar({ accuracy }: { accuracy: number }) {
  const stars = accuracy >= 0.9 ? 3 : accuracy >= 0.6 ? 2 : 1
  return (
    <div className="round-end__stars" aria-label={`${stars} z 3 hviezd`}>
      {[1, 2, 3].map(s => (
        <span key={s} className={`round-end__star${s <= stars ? ' round-end__star--filled' : ''}`}>
          ★
        </span>
      ))}
    </div>
  )
}

export function RoundEndPage() {
  const navigate = useNavigate()
  const snapshot = useSessionStore(s => s.snapshot)
  const clearSession = useSessionStore(s => s.clearSession)
  const { activeProfile } = useProfile()
  const navigating = useRef(false)

  if (!snapshot || !activeProfile) {
    if (!navigating.current) navigate({ to: '/login' })
    return null
  }

  const { lastRoundResult, gameStatus, routes, restartRound, resetGame } = snapshot
  const isGameOver = gameStatus === 'game_over'
  const accuracy = lastRoundResult.accuracy
  const pct = Math.round(accuracy * 100)

  const handleBack = () => {
    navigating.current = true
    resetGame()
    clearSession()
    navigate({ to: routes.setupPage, search: {} })
  }

  const handlePlayAgain = () => {
    navigating.current = true
    restartRound()
    clearSession()
    navigate({ to: routes.gamePage, search: {} })
  }

  const handleSetup = () => {
    navigating.current = true
    resetGame()
    clearSession()
    navigate({ to: routes.setupPage, search: {} })
  }

  return (
    <div className="round-end-page" data-testid="round-end-page">
      <AppToolbar onBack={handleBack} />

      <main className="round-end__body anim-celebrate">
        {lastRoundResult.leveledUp && (
          <div className="round-end__level-up anim-celebrate" role="alert">
            🎉 Postup na Level {lastRoundResult.newLevel}!
            {lastRoundResult.skillPointsEarned > 0 && (
              <span className="round-end__sp-earned">
                ✦ +{lastRoundResult.skillPointsEarned} SP
              </span>
            )}
          </div>
        )}

        {lastRoundResult.streakIncreased && (
          <div className="round-end__streak-banner" role="alert">
            🔥 {lastRoundResult.streak}-dňová séria!
          </div>
        )}
        {!lastRoundResult.streakIncreased && lastRoundResult.streak === 1 && (
          <div className="round-end__streak-start" role="status">
            🔥 Začal si sériu!
          </div>
        )}

        <div className="round-end__card">
          <h1 className="round-end__title">
            {isGameOver ? 'Nevadí, skús znova!' : accuracy >= 0.8 ? 'Skvelá práca!' : 'Dobrá práca!'}
          </h1>

          <AccuracyStar accuracy={accuracy} />

          <div className="round-end__stats">
            <div className="round-end__stat">
              <span className="round-end__stat-value round-end__stat-value--xp" data-testid="xp-earned">
                +{lastRoundResult.xpEarned}
              </span>
              <span className="round-end__stat-label">XP</span>
            </div>
            <div className="round-end__stat">
              <span className="round-end__stat-value" data-testid="accuracy-pct">{pct}%</span>
              <span className="round-end__stat-label">Správnosť</span>
            </div>
            <div className="round-end__stat">
              <span className="round-end__stat-value">
                {lastRoundResult.correctCount}/{lastRoundResult.totalBlanks}
              </span>
              <span className="round-end__stat-label">Správne</span>
            </div>
          </div>

          <div className="round-end__actions">
            <button className="btn btn--ghost" data-testid="change-settings-btn" onClick={handleSetup}>
              Zmeniť nastavenie
            </button>
            <button className="btn btn--primary" data-testid="play-again-btn" onClick={handlePlayAgain}>
              Hrať znova →
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
