import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import './MathSetupPage.css'
import { useProfile } from '../../hooks/useProfile'
import { useMathGame } from '../../hooks/useMathGame'
import { AppToolbar } from '../../components/AppToolbar/AppToolbar'
import type { MathCategory, NasobilkaMode, MathAnswerMode } from '../../../domain/entities/math-exercise.entity'

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

export function MathSetupPage() {
  const navigate = useNavigate()
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
    navigate({ to: '/game/matematika/play' })
  }

  return (
    <main className="math-setup" data-testid="math-setup-page">
      <AppToolbar onBack={() => navigate({ to: '/dashboard' })} />

      <div className="math-setup__body">
        <h1 className="math-setup__title">Matematika</h1>

        <div className="math-setup__options">

          <section className="setup-section">
            <h2 className="setup-section__label">Kategória</h2>
            <div className="math-category-grid">
              {CATEGORY_OPTIONS.map(({ value, label, icon }) => (
                <button
                  key={value}
                  className={`math-category-btn${category === value ? ' math-category-btn--active' : ''}`}
                  data-testid={`category-${value}`}
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
                    data-testid={`nasobilka-${value}`}
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
                  data-testid={`answer-mode-${value}`}
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
              data-testid="timer-toggle"
              onClick={() => setTimerEnabled(v => !v)}
              aria-pressed={timerEnabled}
            >
              <span className="setup-timer-toggle__icon">{timerEnabled ? '⏱' : '∞'}</span>
              <span>{timerEnabled ? '20s na príklad — bonus XP' : 'Bez časovača'}</span>
            </button>
          </section>

        </div>

        <div className="math-setup__footer">
          <button className="btn btn--primary math-setup__start" data-testid="start-btn" onClick={handleStart}>
            Hrať &rarr;
          </button>
        </div>
      </div>
    </main>
  )
}
