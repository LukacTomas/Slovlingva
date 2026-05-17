import './SubjectSelectPage.css'
import { useProfile } from '../../hooks/useProfile'
import { LevelBadge } from '../../components/LevelBadge/LevelBadge'
import { XPBar } from '../../components/XPBar/XPBar'
import type { AppPage } from '../../../App'

const AVATARS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐸']

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
      <button className="subject-select__back btn btn--ghost" onClick={() => onNavigate('profile-select')}>
        &larr; Sp&auml;ť
      </button>

      <div className="subject-select__profile">
        <span className="subject-select__avatar">{AVATARS[activeProfile.avatarIndex % AVATARS.length]}</span>
        <div className="subject-select__profile-info">
          <span className="subject-select__profile-name">{activeProfile.name}</span>
          <XPBar totalXP={activeProfile.totalXP} />
        </div>
        <LevelBadge level={activeProfile.level} />
      </div>

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
    </main>
  )
}
