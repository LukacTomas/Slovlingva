import { useNavigate } from '@tanstack/react-router'
import './SkillsPage.css'
import { useProfile } from '../../hooks/useProfile'
import { AppToolbar } from '../../components/AppToolbar/AppToolbar'
import { SKILL_META, SKILL_CAPS, SKILL_SP_COST } from '../../../domain/entities/skill.entity'
import type { SkillKey } from '../../../domain/entities/skill.entity'

export function SkillsPage() {
  const navigate = useNavigate()
  const { activeProfile, upgradeSkill } = useProfile()

  if (!activeProfile) {
    return null
  }

  const sp = activeProfile.skillPoints
  const allMaxed = (Object.keys(SKILL_CAPS) as SkillKey[]).every(
    k => activeProfile.skills[k] >= SKILL_CAPS[k]
  )

  return (
    <main className="skills-page" data-testid="skills-page">
      <AppToolbar onBack={() => navigate({ to: '/dashboard' })} />

      <div className="skills-page__body">
        <header className="skills-page__header">
          <h1 className="skills-page__title">Schopnosti</h1>
          <div className="skills-page__sp-balance" data-testid="sp-balance" aria-label={`${sp} voľných bodov dovedností`}>
            <span className="skills-page__sp-icon">✦</span>
            <span className="skills-page__sp-value">{sp}</span>
            <span className="skills-page__sp-label">bodov dovedností</span>
          </div>

          {allMaxed ? (
            <div className="skills-page__all-maxed" role="status">
              <span className="skills-page__all-maxed-icon">🏆</span>
              <div>
                <strong>Všetky dovednosti sú na maxime!</strong>
                <p>
                  {sp > 0
                    ? `Body sa hromadia — ${sp} SP čaká na nové dovednosti.`
                    : 'Pokračuj v hraní a zbieraj ďalšie body.'
                  }
                </p>
              </div>
            </div>
          ) : sp === 0 ? (
            <p className="skills-page__sp-hint">
              Získaj body postupom na vyšší level
            </p>
          ) : null}
        </header>

        <div className="skills-grid">
          {SKILL_META.map(meta => {
            const currentLevel = activeProfile.skills[meta.key]
            const cap = SKILL_CAPS[meta.key]
            const atMax = currentLevel >= cap
            const canAfford = sp >= SKILL_SP_COST
            const canUpgrade = !atMax && canAfford

            return (
              <div
                key={meta.key}
                className={`skill-card${atMax ? ' skill-card--maxed' : ''}`}
              >
                <div className="skill-card__icon" aria-hidden="true">{meta.icon}</div>
                <div className="skill-card__body">
                  <h2 className="skill-card__name">{meta.name}</h2>
                  <p className="skill-card__desc">
                    {currentLevel > 0
                      ? meta.description(currentLevel)
                      : <span className="skill-card__locked">Nie je odomknuté</span>
                    }
                  </p>
                  {/* Level pips */}
                  <div className="skill-card__pips" aria-label={`Úroveň ${currentLevel} z ${cap}`}>
                    {Array.from({ length: cap }).map((_, i) => (
                      <span
                        key={i}
                        className={`skill-card__pip${i < currentLevel ? ' skill-card__pip--filled' : ''}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="skill-card__action">
                  {atMax ? (
                    <span className="skill-card__maxed-label">MAX</span>
                  ) : (
                    <button
                      className="skill-card__upgrade-btn"
                      onClick={() => upgradeSkill(meta.key)}
                      disabled={!canUpgrade}
                      aria-label={`Vylepšiť ${meta.name} za ${SKILL_SP_COST} SP`}
                    >
                      <span className="skill-card__cost">✦ {SKILL_SP_COST} SP</span>
                      <span className="skill-card__upgrade-label">Vylepšiť</span>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
