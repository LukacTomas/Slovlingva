import './SubjectSelectPage.css'
import { useProfile } from '../../hooks/useProfile'
import { AppToolbar } from '../../components/AppToolbar/AppToolbar'
import type { AppPage } from '../../../App'

interface SubjectSelectPageProps {
  onNavigate: (page: AppPage) => void
}

export function SubjectSelectPage({ onNavigate }: SubjectSelectPageProps) {
  const { activeProfile } = useProfile()

  if (!activeProfile) {
    onNavigate('profile-select')
    return null
  }

  return (
    <main className="subject-select">
      <AppToolbar onBack={() => onNavigate('profile-select')} onNavigate={onNavigate} />

      <div className="subject-select__body">
        <h1 className="subject-select__title">Vyber si predmet</h1>

        <div className="subject-select__grid">
          <button
            className="subject-card subject-card--slovencina"
            onClick={() => onNavigate('game-setup')}
            aria-label="Slovenčina"
          >
            <span className="subject-card__icon">Aa</span>
            <span className="subject-card__name">Slovenčina</span>
            <span className="subject-card__desc">i/y, vybrané slová, diktáty</span>
          </button>

          <button
            className="subject-card subject-card--matematika"
            onClick={() => onNavigate('math-setup')}
            aria-label="Matematika"
          >
            <span className="subject-card__icon">123</span>
            <span className="subject-card__name">Matematika</span>
            <span className="subject-card__desc">sčítanie, odčítanie, násobilka</span>
          </button>
        </div>

        <div className="subject-select__footer">
          <button className="btn btn--ghost subject-select__skills-btn" onClick={() => onNavigate('skills')}>
            ✦ Schopnosti
          </button>
        </div>
      </div>
    </main>
  )
}
