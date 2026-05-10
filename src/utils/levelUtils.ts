const BASE_XP = 100
const MULTIPLIER = 1.7

export function xpForLevel(level: number): number {
  if (level <= 1) return 0
  let threshold = BASE_XP
  for (let l = 3; l <= level; l++) {
    threshold = Math.round(threshold * MULTIPLIER)
  }
  return level === 2 ? BASE_XP : xpForLevel(level - 1) + threshold
}

export function levelFromXP(xp: number): number {
  let level = 1
  while (xpForLevel(level + 1) <= xp) {
    level++
  }
  return level
}

export function xpProgressInLevel(xp: number): number {
  const currentLevel = levelFromXP(xp)
  const currentThreshold = xpForLevel(currentLevel)
  const nextThreshold = xpForLevel(currentLevel + 1)
  return (xp - currentThreshold) / (nextThreshold - currentThreshold)
}
