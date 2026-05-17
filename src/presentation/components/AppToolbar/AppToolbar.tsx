import { useState, useEffect, useRef } from 'react'
import './AppToolbar.css'
import { useProfile } from '../../hooks/useProfile'
import { XPBar } from '../XPBar/XPBar'
import { LevelBadge } from '../LevelBadge/LevelBadge'
import { avatarEmoji } from '../../../utils/avatars'
import { SKILL_CAPS } from '../../../domain/entities/skill.entity'
import type { AppPage } from '../../../App'
import type { ISkills, SkillKey } from '../../../domain/entities/skill.entity'

function allSkillsMaxed(skills: ISkills): boolean {
  return (Object.keys(SKILL_CAPS) as SkillKey[]).every(k => skills[k] >= SKILL_CAPS[k])
}

interface AppToolbarProps {
  onBack: () => void
  onNavigate: (page: AppPage) => void
}

export function AppToolbar({ onBack, onNavigate }: AppToolbarProps) {
  const { activeProfile } = useProfile()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    if (!menuOpen) return
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [menuOpen])

  if (!activeProfile) return null

  const sp = activeProfile.skillPoints
  const spendable = sp > 0 && !allSkillsMaxed(activeProfile.skills)

  return (
    <header className="app-toolbar">
      <button
        className="app-toolbar__back"
        onClick={onBack}
        aria-label="Späť"
      >
        &#8592;
      </button>

      <div className="app-toolbar__center">
        <XPBar totalXP={activeProfile.totalXP} />
        <LevelBadge level={activeProfile.level} />
      </div>

      <div className="app-toolbar__menu-anchor" ref={menuRef}>
        <button
          className="app-toolbar__avatar-btn"
          onClick={() => setMenuOpen(v => !v)}
          aria-expanded={menuOpen}
          aria-haspopup="true"
          aria-label="Menu"
        >
          {avatarEmoji(activeProfile.avatarIndex)}
          <span className="app-toolbar__caret">{menuOpen ? '▲' : '▼'}</span>
          {spendable && <span className="app-toolbar__sp-dot" aria-hidden="true" />}
        </button>

        {menuOpen && (
          <div className="app-toolbar__dropdown" role="menu">
            <div className="app-toolbar__dropdown-header">
              <span className="app-toolbar__dropdown-name">{activeProfile.name}</span>
              {activeProfile.streak > 1 && (
                <span className="app-toolbar__streak">
                  🔥 {activeProfile.streak}-dňová séria
                </span>
              )}
            </div>

            <button
              className="app-toolbar__dropdown-item"
              role="menuitem"
              onClick={() => { setMenuOpen(false); onNavigate('skills') }}
            >
              ✦ Schopnosti
              {spendable && (
                <span className="app-toolbar__sp-badge">
                  {sp} SP
                </span>
              )}
            </button>

            <button
              className="app-toolbar__dropdown-item"
              role="menuitem"
              onClick={() => { setMenuOpen(false); onNavigate('profile-select') }}
            >
              👤 Zmeniť hráča
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
