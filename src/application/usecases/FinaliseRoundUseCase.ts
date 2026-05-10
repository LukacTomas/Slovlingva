import type { IRoundResult } from '../../domain/entities/game.entity'
import type { IProfileRepository } from '../../domain/ports/IProfileRepository'
import { levelFromXP } from '../../utils/levelUtils'
import { toISODateString, getYesterdayOf } from '../../utils/dateUtils'

const XP_PER_CORRECT = 10
const TIMER_BONUS_MULTIPLIER = 1.5
const XP_BOOST_PER_LEVEL = 0.1  // +10% per xpBoostLevel

export interface IFinaliseRoundInput {
  correctCount: number
  totalBlanks: number
  timerBonus: boolean
  /** ISO YYYY-MM-DD date for this play; defaults to today's local date when omitted. */
  today?: string
}

export class FinaliseRoundUseCase {
  private readonly profileRepository: IProfileRepository

  constructor(profileRepository: IProfileRepository) {
    this.profileRepository = profileRepository
  }

  execute({ correctCount, totalBlanks, timerBonus, today }: IFinaliseRoundInput): IRoundResult {
    const activeId = this.profileRepository.getActiveId()
    const profile = activeId ? this.profileRepository.findById(activeId) : null
    if (!profile) throw new Error('No active profile — cannot finalise round')

    // XP boost multiplier from purchased upgrades (default 0 → 1.0×)
    const xpBoostLevel = profile.skills?.xpBoostLevel ?? 0
    const xpMultiplier = 1 + xpBoostLevel * XP_BOOST_PER_LEVEL

    let xpEarned = Math.round(correctCount * XP_PER_CORRECT * xpMultiplier)
    if (timerBonus) xpEarned = Math.round(xpEarned * TIMER_BONUS_MULTIPLIER)

    const prevLevel = levelFromXP(profile.totalXP)
    const newXP = profile.totalXP + xpEarned
    const newLevel = levelFromXP(newXP)

    // Award 1 SP for each level gained this round
    const levelsGained = Math.max(0, newLevel - prevLevel)
    const skillPointsEarned = levelsGained
    const newSkillPoints = (profile.skillPoints ?? 0) + skillPointsEarned

    // ── Streak logic ──────────────────────────────────────────────────────────
    const todayStr = today ?? toISODateString(new Date())
    const last = profile.lastPlayedDate ?? ''
    let newStreak: number
    let streakIncreased: boolean

    if (last === todayStr) {
      // Already played today — preserve streak, no increase
      newStreak = profile.streak
      streakIncreased = false
    } else if (last === getYesterdayOf(todayStr)) {
      // Consecutive day — increment streak
      newStreak = profile.streak + 1
      streakIncreased = true
    } else {
      // First play ever, or streak broken — reset to 1
      newStreak = 1
      streakIncreased = false
    }

    this.profileRepository.save({
      ...profile,
      totalXP: newXP,
      level: newLevel,
      skillPoints: newSkillPoints,
      gamesPlayed: profile.gamesPlayed + 1,
      totalCorrect: profile.totalCorrect + correctCount,
      totalAttempts: profile.totalAttempts + totalBlanks,
      streak: newStreak,
      lastPlayedDate: todayStr,
    })

    return {
      xpEarned,
      accuracy: totalBlanks > 0 ? correctCount / totalBlanks : 0,
      correctCount,
      totalBlanks,
      leveledUp: newLevel > prevLevel,
      newLevel,
      skillPointsEarned,
      streak: newStreak,
      streakIncreased,
    }
  }
}
