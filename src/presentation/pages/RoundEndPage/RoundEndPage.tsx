import './RoundEndPage.css'
import { useGame } from '../../hooks/useGame'
import { useMathGame } from '../../hooks/useMathGame'
import { useProfile } from '../../hooks/useProfile'
import { LevelBadge } from '../../components/LevelBadge/LevelBadge'
import { XPBar } from '../../components/XPBar/XPBar'
import type { AppPage } from '../../../App'

const AVATARS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐸']

interface RoundEndPageProps {
  onNavigate: (page: AppPage) => void
  isMath?: boolean
}

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

export function RoundEndPage({ onNavigate, isMath = false }: RoundEndPageProps) {
  const slovGame = useGame()
  const mathGame = useMathGame()

  const lastRoundResult = isMath ? mathGame.lastRoundResult : slovGame.lastRoundResult
  const gameStatus = isMath
    ? mathGame.gameState?.status
    : slovGame.gameState?.status
  const resetGame = isMath ? mathGame.resetGame : slovGame.resetGame
  const { activeProfile } = useProfile()

  if (!lastRoundResult || !activeProfile) {
    onNavigate('profile-select')
    return null
  }

  const isGameOver = gameStatus === 'game_over'
  const accuracy = lastRoundResult.accuracy
  const pct = Math.round(accuracy * 100)

  const handlePlayAgain = () => {
    if (isMath) {
      mathGame.startRound(mathGame.gameState!.config)
      onNavigate('math-game')
    } else {
      slovGame.startRound(slovGame.gameState!.config)
      onNavigate('game')
    }
  }

  const handleSetup = () => {
    resetGame()
    onNavigate(isMath ? 'math-setup' : 'game-setup')
  }

  return (
    <main className="round-end anim-celebrate">
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
        <div className="round-end__avatar">
          {AVATARS[activeProfile.avatarIndex % AVATARS.length]}
        </div>

        <h1 className="round-end__title">
          {isGameOver ? 'Nevadí, skús znova!' : accuracy >= 0.8 ? 'Skvelá práca!' : 'Dobrá práca!'}
        </h1>

        <AccuracyStar accuracy={accuracy} />

        <div className="round-end__stats">
          <div className="round-end__stat">
            <span className="round-end__stat-value round-end__stat-value--xp">
              +{lastRoundResult.xpEarned}
            </span>
            <span className="round-end__stat-label">XP</span>
          </div>
          <div className="round-end__stat">
            <span className="round-end__stat-value">{pct}%</span>
            <span className="round-end__stat-label">Správnosť</span>
          </div>
          <div className="round-end__stat">
            <span className="round-end__stat-value">
              {lastRoundResult.correctCount}/{lastRoundResult.totalBlanks}
            </span>
            <span className="round-end__stat-label">Správne</span>
          </div>
        </div>

        <div className="round-end__profile-bar">
          <LevelBadge level={activeProfile.level} />
          <XPBar totalXP={activeProfile.totalXP} />
        </div>

        <div className="round-end__actions">
          <button className="btn btn--ghost" onClick={handleSetup}>
            Zmeniť nastavenie
          </button>
          <button className="btn btn--primary" onClick={handlePlayAgain}>
            Hrať znova →
          </button>
        </div>
      </div>
    </main>
  )
}
