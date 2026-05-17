import { describe, it, expect, beforeEach } from 'vitest'
import { FinaliseRoundUseCase } from './FinaliseRoundUseCase'
import { ProfileRepository } from '../../infrastructure/repositories/ProfileRepository'
import { LocalStorageAdapter } from '../../infrastructure/storage/LocalStorageAdapter'
import { DEFAULT_SKILLS } from '../../domain/entities/skill.entity'
import type { IProfile } from '../../domain/entities/profile.entity'

function makeProfile(overrides: Partial<IProfile> = {}): IProfile {
  return {
    id: 'p1',
    name: 'Alice',
    avatarIndex: 0,
    totalXP: 0,
    level: 1,
    skillPoints: 0,
    skills: { ...DEFAULT_SKILLS },
    gamesPlayed: 0,
    totalCorrect: 0,
    totalAttempts: 0,
    streak: 0,
    lastPlayedDate: '',
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

describe('FinaliseRoundUseCase', () => {
  let repo: ProfileRepository
  let useCase: FinaliseRoundUseCase

  beforeEach(() => {
    localStorage.clear()
    repo = new ProfileRepository(new LocalStorageAdapter())
    useCase = new FinaliseRoundUseCase(repo)
  })

  it('throws when no active profile is set', async () => {
    await expect(useCase.execute({ correctCount: 6, totalBlanks: 6, timerBonus: false })).rejects.toThrow()
  })

  it('returns 0 XP when no blanks were correct', async () => {
    await repo.save(makeProfile())
    await repo.setActiveId('p1')
    const result = await useCase.execute({ correctCount: 0, totalBlanks: 6, timerBonus: false })
    expect(result.xpEarned).toBe(0)
  })

  it('returns positive XP for correct answers', async () => {
    await repo.save(makeProfile())
    await repo.setActiveId('p1')
    const result = await useCase.execute({ correctCount: 6, totalBlanks: 6, timerBonus: false })
    expect(result.xpEarned).toBeGreaterThan(0)
  })

  it('applies timer bonus multiplier', async () => {
    await repo.save(makeProfile())
    await repo.setActiveId('p1')
    const without = await useCase.execute({ correctCount: 6, totalBlanks: 6, timerBonus: false })
    await repo.save(makeProfile({ totalXP: 0, gamesPlayed: 0, totalCorrect: 0, totalAttempts: 0 }))
    const withBonus = await useCase.execute({ correctCount: 6, totalBlanks: 6, timerBonus: true })
    expect(withBonus.xpEarned).toBeGreaterThan(without.xpEarned)
  })

  it('calculates accuracy as correctCount / totalBlanks', async () => {
    await repo.save(makeProfile())
    await repo.setActiveId('p1')
    const result = await useCase.execute({ correctCount: 3, totalBlanks: 6, timerBonus: false })
    expect(result.accuracy).toBeCloseTo(0.5)
  })

  it('updates profile totalXP in repository', async () => {
    await repo.save(makeProfile())
    await repo.setActiveId('p1')
    await useCase.execute({ correctCount: 6, totalBlanks: 6, timerBonus: false })
    expect((await repo.findById('p1'))?.totalXP).toBeGreaterThan(0)
  })

  it('sets leveledUp true when XP crosses a threshold', async () => {
    await repo.save(makeProfile({ totalXP: 99 }))
    await repo.setActiveId('p1')
    const result = await useCase.execute({ correctCount: 6, totalBlanks: 6, timerBonus: false })
    expect(result.leveledUp).toBe(true)
  })

  it('sets leveledUp false when XP does not cross a threshold', async () => {
    await repo.save(makeProfile({ totalXP: 0 }))
    await repo.setActiveId('p1')
    const result = await useCase.execute({ correctCount: 1, totalBlanks: 6, timerBonus: false })
    expect(result.leveledUp).toBe(false)
  })

  it('awards 1 skillPoint when a level-up occurs', async () => {
    await repo.save(makeProfile({ totalXP: 99 }))   // 1 correct blank = 10 XP → crosses 100 threshold
    await repo.setActiveId('p1')
    const result = await useCase.execute({ correctCount: 6, totalBlanks: 6, timerBonus: false })
    expect(result.skillPointsEarned).toBe(1)
    expect((await repo.findById('p1'))?.skillPoints).toBe(1)
  })

  it('awards 0 skillPoints when no level-up occurs', async () => {
    await repo.save(makeProfile({ totalXP: 0 }))
    await repo.setActiveId('p1')
    const result = await useCase.execute({ correctCount: 1, totalBlanks: 6, timerBonus: false })
    expect(result.skillPointsEarned).toBe(0)
    expect((await repo.findById('p1'))?.skillPoints).toBe(0)
  })

  it('applies xpBoostLevel multiplier to XP earned', async () => {
    // xpBoostLevel: 2 → +20% XP
    await repo.save(makeProfile({ skills: { ...DEFAULT_SKILLS, xpBoostLevel: 2 } }))
    await repo.setActiveId('p1')
    const boosted = await useCase.execute({ correctCount: 6, totalBlanks: 6, timerBonus: false })
    // baseline: 6 * 10 = 60; with 20% boost: 6 * 10 * 1.2 = 72
    expect(boosted.xpEarned).toBe(72)
  })

  it('includes skillPointsEarned field in result', async () => {
    await repo.save(makeProfile())
    await repo.setActiveId('p1')
    const result = await useCase.execute({ correctCount: 6, totalBlanks: 6, timerBonus: false })
    expect(result).toHaveProperty('skillPointsEarned')
  })
})

describe('FinaliseRoundUseCase — streak', () => {
  let repo: ProfileRepository
  let useCase: FinaliseRoundUseCase

  beforeEach(() => {
    localStorage.clear()
    repo = new ProfileRepository(new LocalStorageAdapter())
    useCase = new FinaliseRoundUseCase(repo)
  })

  it('sets streak to 1 and streakIncreased to false on first play', async () => {
    await repo.save(makeProfile({ streak: 0, lastPlayedDate: '' }))
    await repo.setActiveId('p1')
    const result = await useCase.execute({ correctCount: 3, totalBlanks: 6, timerBonus: false, today: '2024-06-10' })
    expect(result.streak).toBe(1)
    expect(result.streakIncreased).toBe(false)
    expect((await repo.findById('p1'))?.streak).toBe(1)
    expect((await repo.findById('p1'))?.lastPlayedDate).toBe('2024-06-10')
  })

  it('increments streak and sets streakIncreased to true on consecutive day', async () => {
    await repo.save(makeProfile({ streak: 3, lastPlayedDate: '2024-06-09' }))
    await repo.setActiveId('p1')
    const result = await useCase.execute({ correctCount: 3, totalBlanks: 6, timerBonus: false, today: '2024-06-10' })
    expect(result.streak).toBe(4)
    expect(result.streakIncreased).toBe(true)
    expect((await repo.findById('p1'))?.streak).toBe(4)
    expect((await repo.findById('p1'))?.lastPlayedDate).toBe('2024-06-10')
  })

  it('keeps streak unchanged and sets streakIncreased to false when played again same day', async () => {
    await repo.save(makeProfile({ streak: 5, lastPlayedDate: '2024-06-10' }))
    await repo.setActiveId('p1')
    const result = await useCase.execute({ correctCount: 3, totalBlanks: 6, timerBonus: false, today: '2024-06-10' })
    expect(result.streak).toBe(5)
    expect(result.streakIncreased).toBe(false)
    expect((await repo.findById('p1'))?.streak).toBe(5)
  })

  it('resets streak to 1 and sets streakIncreased to false when streak is broken', async () => {
    await repo.save(makeProfile({ streak: 7, lastPlayedDate: '2024-06-07' }))
    await repo.setActiveId('p1')
    const result = await useCase.execute({ correctCount: 3, totalBlanks: 6, timerBonus: false, today: '2024-06-10' })
    expect(result.streak).toBe(1)
    expect(result.streakIncreased).toBe(false)
    expect((await repo.findById('p1'))?.streak).toBe(1)
    expect((await repo.findById('p1'))?.lastPlayedDate).toBe('2024-06-10')
  })
})
