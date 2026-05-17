import { useNavigate } from '@tanstack/react-router'
import './SubjectSelectPage.css'
import { useProfile } from '../../hooks/useProfile'
import { AppToolbar } from '../../components/AppToolbar/AppToolbar'

export function SubjectSelectPage() {
  const navigate = useNavigate()
  const { activeProfile } = useProfile()

  if (!activeProfile) {
    return null
  }

  return (
    <main className="subject-select" data-testid="subject-select-page">
      <AppToolbar onBack={() => navigate({ to: '/login' })} />

      <div className="subject-select__body">
        <h1 className="subject-select__title">Vyber si predmet</h1>

        <div className="subject-select__grid">
          <button
            className="subject-card subject-card--slovencina"
            data-testid="subject-slovencina"
            onClick={() => navigate({ to: '/game/slovencina/setup', search: {} })}
            aria-label="Slovenčina"
          >
            <span className="subject-card__icon">Aa</span>
            <span className="subject-card__name">Slovenčina</span>
            <span className="subject-card__desc">i/y, vybrané slová, diktáty</span>
          </button>

          <button
            className="subject-card subject-card--matematika"
            data-testid="subject-matematika"
            onClick={() => navigate({ to: '/game/matematika/setup', search: {} })}
            aria-label="Matematika"
          >
            <span className="subject-card__icon">123</span>
            <span className="subject-card__name">Matematika</span>
            <span className="subject-card__desc">sčítanie, odčítanie, násobilka</span>
          </button>
        </div>

        <div className="subject-select__footer">
          <button className="btn btn--ghost subject-select__skills-btn" data-testid="skills-btn" onClick={() => navigate({ to: '/skills' })}>
            ✦ Schopnosti
          </button>
        </div>
      </div>
    </main>
  )
}
