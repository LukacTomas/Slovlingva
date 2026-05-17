import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import './GameSetupPage.css'
import { useProfile } from '../../hooks/useProfile'
import { useGame } from '../../hooks/useGame'
import { AppToolbar } from '../../components/AppToolbar/AppToolbar'
import type { GameMode, DifficultyLevel, VybraneSlovaGroup } from '../../../domain/entities/exercise.entity'

const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  1: 'Ľahká',
  2: 'Stredná',
  3: 'Ťažká',
  4: 'Expert',
}

const VYBRANE_GROUPS: { value: VybraneSlovaGroup; label: string }[] = [
  { value: 'b', label: 'B' },
  { value: 'm', label: 'M' },
  { value: 'p', label: 'P' },
  { value: 'r', label: 'R' },
  { value: 's', label: 'S' },
  { value: 'v', label: 'V' },
  { value: 'z', label: 'Z' },
  { value: 'mix', label: 'Mix' },
]

export function GameSetupPage() {
  const navigate = useNavigate()
  const { activeProfile } = useProfile()
  const { startRound } = useGame()

  const [mode, setMode] = useState<GameMode>('words')
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(1)
  const [timerEnabled, setTimerEnabled] = useState(false)
  const [vybraneSlovaGroup, setVybraneSlovaGroup] = useState<VybraneSlovaGroup>('b')

  const handleStart = () => {
    const skills = activeProfile!.skills
    startRound({
      mode,
      exercisesPerRound: 6,
      maxHearts: 3 + skills.heartSlots,
      timerEnabled,
      secondsPerExercise: 20,
      difficultyLevel: difficulty,
      hintsPerRound: skills.hintsPerRound,
      skipsPerRound: skills.skipCharges,
      ...(mode === 'vybrane-slova' ? { vybraneSlovaGroup } : {}),
    })
    navigate({ to: '/game/slovencina/play' })
  }

  return (
    <main className="game-setup" data-testid="game-setup-page">
      <AppToolbar onBack={() => navigate({ to: '/dashboard' })} />

      <div className="game-setup__body">
        <h1 className="game-setup__title">Nastav hru</h1>

        <div className="game-setup__options">

          <section className="setup-section">
            <h2 className="setup-section__label">Režim</h2>
            <div className="setup-toggle">
              <button
                className={`setup-toggle__btn${mode === 'words' ? ' setup-toggle__btn--active' : ''}`}
                data-testid="mode-words"
                onClick={() => setMode('words')}
              >
                Slová
              </button>
              <button
                className={`setup-toggle__btn${mode === 'sentences' ? ' setup-toggle__btn--active' : ''}`}
                data-testid="mode-sentences"
                onClick={() => setMode('sentences')}
              >
                Vety
              </button>
              <button
                className={`setup-toggle__btn${mode === 'vybrane-slova' ? ' setup-toggle__btn--active' : ''}`}
                data-testid="mode-vybrane"
                onClick={() => setMode('vybrane-slova')}
              >
                Vybrané slová
              </button>
            </div>
          </section>

          {mode === 'words' && (
            <section className="setup-section anim-fade-in">
              <h2 className="setup-section__label">Obtiažnosť</h2>
              <div className="setup-difficulty">
                {([1, 2, 3, 4] as DifficultyLevel[]).map(d => (
                  <button
                    key={d}
                    className={`setup-difficulty__btn${difficulty === d ? ' setup-difficulty__btn--active' : ''}`}
                    data-testid={`difficulty-${d}`}
                    onClick={() => setDifficulty(d)}
                  >
                    <span className="setup-difficulty__num">{d}</span>
                    <span className="setup-difficulty__label">{DIFFICULTY_LABELS[d]}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {mode === 'vybrane-slova' && (
            <section className="setup-section anim-fade-in">
              <h2 className="setup-section__label">Skupina</h2>
              <div className="setup-vybrane-groups">
                {VYBRANE_GROUPS.map(({ value, label }) => (
                  <button
                    key={value}
                    className={`setup-vybrane-groups__btn${vybraneSlovaGroup === value ? ' setup-vybrane-groups__btn--active' : ''}${value === 'mix' ? ' setup-vybrane-groups__btn--mix' : ''}`}
                    onClick={() => setVybraneSlovaGroup(value)}
                    aria-pressed={vybraneSlovaGroup === value}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="setup-section">
            <h2 className="setup-section__label">Časovač</h2>
            <button
              className={`setup-timer-toggle${timerEnabled ? ' setup-timer-toggle--on' : ''}`}
              data-testid="timer-toggle"
              onClick={() => setTimerEnabled(v => !v)}
              aria-pressed={timerEnabled}
            >
              <span className="setup-timer-toggle__icon">{timerEnabled ? '⏱' : '∞'}</span>
              <span>{timerEnabled ? '20s na príklad — bonus XP' : 'Bez časovača'}</span>
            </button>
          </section>

        </div>

        <div className="game-setup__footer">
          <button className="btn btn--primary game-setup__start" data-testid="start-btn" onClick={handleStart}>
            Hrať →
          </button>
        </div>
      </div>
    </main>
  )
}
