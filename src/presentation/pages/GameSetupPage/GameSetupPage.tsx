import { useState } from 'react'
import './GameSetupPage.css'
import { useProfile } from '../../hooks/useProfile'
import { useGame } from '../../hooks/useGame'
import { LevelBadge } from '../../components/LevelBadge/LevelBadge'
import { XPBar } from '../../components/XPBar/XPBar'
import { SKILL_CAPS } from '../../../domain/entities/skill.entity'
import type { AppPage } from '../../../App'
import type { GameMode, DifficultyLevel, VybraneSlovaGroup } from '../../../domain/entities/exercise.entity'
import type { ISkills, SkillKey } from '../../../domain/entities/skill.entity'

const AVATARS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐸']

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

function allSkillsMaxed(skills: ISkills): boolean {
  return (Object.keys(SKILL_CAPS) as SkillKey[]).every(k => skills[k] >= SKILL_CAPS[k])
}

interface GameSetupPageProps {
  onNavigate: (page: AppPage) => void
}

export function GameSetupPage({ onNavigate }: GameSetupPageProps) {
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
    onNavigate('game')
  }

  if (!activeProfile) {
    onNavigate('profile-select')
    return null
  }

  const sp = activeProfile.skillPoints
  // Only show "unspent SP" notifications when there is actually something to buy
  const spendable = sp > 0 && !allSkillsMaxed(activeProfile.skills)

  return (
    <main className="game-setup">
      <button className="game-setup__back btn btn--ghost" onClick={() => onNavigate('subject-select')}>
        &larr; Sp&auml;ť
      </button>

      <div className="game-setup__profile">
        <span className="game-setup__avatar">{AVATARS[activeProfile.avatarIndex % AVATARS.length]}</span>
        <div className="game-setup__profile-info">
          <div className="game-setup__profile-name-row">
            <span className="game-setup__profile-name">{activeProfile.name}</span>
            {spendable && (
              <span className="game-setup__sp-badge" title="Voľné body dovedností">
                ✦ {sp} SP
              </span>
            )}
            {activeProfile.streak > 1 && (
              <span className="game-setup__streak-badge">
                🔥 {activeProfile.streak}-dňová séria
              </span>
            )}
          </div>
          <XPBar totalXP={activeProfile.totalXP} />
        </div>
        <LevelBadge level={activeProfile.level} />
      </div>

      <h1 className="game-setup__title">Nastav hru</h1>

      <div className="game-setup__options">

        <section className="setup-section">
          <h2 className="setup-section__label">Režim</h2>
          <div className="setup-toggle">
            <button
              className={`setup-toggle__btn${mode === 'words' ? ' setup-toggle__btn--active' : ''}`}
              onClick={() => setMode('words')}
            >
              Slová
            </button>
            <button
              className={`setup-toggle__btn${mode === 'sentences' ? ' setup-toggle__btn--active' : ''}`}
              onClick={() => setMode('sentences')}
            >
              Vety
            </button>
            <button
              className={`setup-toggle__btn${mode === 'vybrane-slova' ? ' setup-toggle__btn--active' : ''}`}
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
            onClick={() => setTimerEnabled(v => !v)}
            aria-pressed={timerEnabled}
          >
            <span className="setup-timer-toggle__icon">{timerEnabled ? '⏱' : '∞'}</span>
            <span>{timerEnabled ? '20s na príklad — bonus XP' : 'Bez časovača'}</span>
          </button>
        </section>

      </div>

      <div className="game-setup__footer">
        <button className="btn btn--ghost game-setup__skills-btn" onClick={() => onNavigate('skills')}>
          ✦ Schopnosti
          {spendable && <span className="game-setup__skills-dot" aria-hidden="true" />}
        </button>
        <button className="btn btn--primary game-setup__start" onClick={handleStart}>
          Hrať →
        </button>
      </div>
    </main>
  )
}

