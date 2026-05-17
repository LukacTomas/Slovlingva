import { useState } from 'react'
import './MathSetupPage.css'
import { useProfile } from '../../hooks/useProfile'
import { useMathGame } from '../../hooks/useMathGame'
import { LevelBadge } from '../../components/LevelBadge/LevelBadge'
import { XPBar } from '../../components/XPBar/XPBar'
import { SKILL_CAPS } from '../../../domain/entities/skill.entity'
import type { AppPage } from '../../../App'
import type { MathCategory, NasobilkaMode, MathAnswerMode } from '../../../domain/entities/math-exercise.entity'
import type { ISkills, SkillKey } from '../../../domain/entities/skill.entity'

const AVATARS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐸']

const CATEGORY_OPTIONS: { value: MathCategory; label: string; icon: string }[] = [
  { value: 'add-sub-10', label: '+ - do 10', icon: '10' },
  { value: 'add-sub-20', label: '+ - do 20', icon: '20' },
  { value: 'add-sub-100', label: '+ - do 100', icon: '100' },
  { value: 'add-sub-1000', label: '+ - do 1000', icon: '1000' },
  { value: 'nasobilka', label: 'Násobilka a delenie', icon: '×:' },
]

const NASOBILKA_MODES: { value: NasobilkaMode; label: string }[] = [
  { value: 'multiply', label: 'Násobenie' },
  { value: 'divide', label: 'Delenie' },
  { value: 'both', label: 'Oboje' },
]

const ANSWER_MODES: { value: MathAnswerMode; label: string }[] = [
  { value: 'choice', label: 'Výber' },
  { value: 'input', label: 'Písanie' },
]

function allSkillsMaxed(skills: ISkills): boolean {
  return (Object.keys(SKILL_CAPS) as SkillKey[]).every(k => skills[k] >= SKILL_CAPS[k])
}

interface MathSetupPageProps {
  onNavigate: (page: AppPage) => void
}

export function MathSetupPage({ onNavigate }: MathSetupPageProps) {
  const { activeProfile } = useProfile()
  const { startRound } = useMathGame()

  const [category, setCategory] = useState<MathCategory>('add-sub-10')
  const [nasobilkaMode, setNasobilkaMode] = useState<NasobilkaMode>('both')
  const [answerMode, setAnswerMode] = useState<MathAnswerMode>('choice')
  const [timerEnabled, setTimerEnabled] = useState(false)

  const handleStart = () => {
    const skills = activeProfile!.skills
    startRound({
      category,
      answerMode,
      exercisesPerRound: 6,
      maxHearts: 3 + skills.heartSlots,
      timerEnabled,
      secondsPerExercise: 20,
      hintsPerRound: skills.hintsPerRound,
      skipsPerRound: skills.skipCharges,
      ...(category === 'nasobilka' ? { nasobilkaMode } : {}),
    })
    onNavigate('math-game')
  }

  if (!activeProfile) {
    onNavigate('profile-select')
    return null
  }

  const sp = activeProfile.skillPoints
  const spendable = sp > 0 && !allSkillsMaxed(activeProfile.skills)

  return (
    <main className="math-setup">
      <button className="math-setup__back btn btn--ghost" onClick={() => onNavigate('subject-select')}>
        &larr; Sp&auml;ť
      </button>

      <div className="math-setup__profile">
        <span className="math-setup__avatar">{AVATARS[activeProfile.avatarIndex % AVATARS.length]}</span>
        <div className="math-setup__profile-info">
          <div className="math-setup__profile-name-row">
            <span className="math-setup__profile-name">{activeProfile.name}</span>
            {spendable && (
              <span className="math-setup__sp-badge" title="Voľné body dovedností">
                ✦ {sp} SP
              </span>
            )}
            {activeProfile.streak > 1 && (
              <span className="math-setup__streak-badge">
                🔥 {activeProfile.streak}-dňová séria
              </span>
            )}
          </div>
          <XPBar totalXP={activeProfile.totalXP} />
        </div>
        <LevelBadge level={activeProfile.level} />
      </div>

      <h1 className="math-setup__title">Matematika</h1>

      <div className="math-setup__options">

        <section className="setup-section">
          <h2 className="setup-section__label">Kategória</h2>
          <div className="math-category-grid">
            {CATEGORY_OPTIONS.map(({ value, label, icon }) => (
              <button
                key={value}
                className={`math-category-btn${category === value ? ' math-category-btn--active' : ''}`}
                onClick={() => setCategory(value)}
                aria-pressed={category === value}
              >
                <span className="math-category-btn__icon">{icon}</span>
                <span className="math-category-btn__label">{label}</span>
              </button>
            ))}
          </div>
        </section>

        {category === 'nasobilka' && (
          <section className="setup-section anim-fade-in">
            <h2 className="setup-section__label">Typ</h2>
            <div className="setup-toggle">
              {NASOBILKA_MODES.map(({ value, label }) => (
                <button
                  key={value}
                  className={`setup-toggle__btn${nasobilkaMode === value ? ' setup-toggle__btn--active' : ''}`}
                  onClick={() => setNasobilkaMode(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="setup-section">
          <h2 className="setup-section__label">Odpoveď</h2>
          <div className="setup-toggle">
            {ANSWER_MODES.map(({ value, label }) => (
              <button
                key={value}
                className={`setup-toggle__btn${answerMode === value ? ' setup-toggle__btn--active' : ''}`}
                onClick={() => setAnswerMode(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

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

      <div className="math-setup__footer">
        <button className="btn btn--ghost math-setup__skills-btn" onClick={() => onNavigate('skills')}>
          ✦ Schopnosti
          {spendable && <span className="math-setup__skills-dot" aria-hidden="true" />}
        </button>
        <button className="btn btn--primary math-setup__start" onClick={handleStart}>
          Hrať &rarr;
        </button>
      </div>
    </main>
  )
}
