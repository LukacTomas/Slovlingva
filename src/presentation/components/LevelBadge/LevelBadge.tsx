import './LevelBadge.css'

interface LevelBadgeProps {
  level: number
}

export function LevelBadge({ level }: LevelBadgeProps) {
  return (
    <div className="level-badge" aria-label={`Level ${level}`}>
      <span className="level-badge__label">LVL</span>
      <span className="level-badge__value">{level}</span>
    </div>
  )
}
