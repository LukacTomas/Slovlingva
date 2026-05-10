import './XPBar.css'
import { xpProgressInLevel, xpForLevel, levelFromXP } from '../../../utils/levelUtils'

interface XPBarProps {
  totalXP: number
}

export function XPBar({ totalXP }: XPBarProps) {
  const progress = xpProgressInLevel(totalXP)
  const level = levelFromXP(totalXP)
  const current = xpForLevel(level)
  const next = xpForLevel(level + 1)
  const xpInLevel = totalXP - current
  const xpNeeded = next - current

  return (
    <div className="xp-bar" aria-label={`${xpInLevel} of ${xpNeeded} XP to next level`}>
      <div className="xp-bar__track">
        <div
          className="xp-bar__fill"
          style={{ width: `${Math.min(progress * 100, 100)}%` }}
        />
      </div>
      <span className="xp-bar__text">{xpInLevel} / {xpNeeded} XP</span>
    </div>
  )
}
