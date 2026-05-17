import { describe, it, expect, beforeEach } from 'vitest'
import { UpgradeSkillUseCase } from './UpgradeSkillUseCase'
import { ProfileRepository } from '../../infrastructure/repositories/ProfileRepository'
import { LocalStorageAdapter } from '../../infrastructure/storage/LocalStorageAdapter'
import { DEFAULT_SKILLS, SKILL_CAPS } from '../../domain/entities/skill.entity'
import type { IProfile } from '../../domain/entities/profile.entity'
import type { SkillKey } from '../../domain/entities/skill.entity'

function makeProfile(overrides: Partial<IProfile> = {}): IProfile {
  return {
    id: 'p1',
    name: 'Alice',
    avatarIndex: 0,
    totalXP: 0,
    level: 1,
    skillPoints: 1,
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

describe('UpgradeSkillUseCase', () => {
  let repo: ProfileRepository
  let useCase: UpgradeSkillUseCase

  beforeEach(() => {
    localStorage.clear()
    repo = new ProfileRepository(new LocalStorageAdapter())
    useCase = new UpgradeSkillUseCase(repo)
  })

  it('throws when profile does not exist', async () => {
    await expect(useCase.execute('nonexistent', 'heartSlots')).rejects.toThrow(/not found/i)
  })

  it('throws when player has 0 skill points', async () => {
    await repo.save(makeProfile({ skillPoints: 0 }))
    await expect(useCase.execute('p1', 'heartSlots')).rejects.toThrow(/not enough/i)
  })

  it('throws when skill is already at max level', async () => {
    const cap = SKILL_CAPS.heartSlots
    await repo.save(makeProfile({ skills: { ...DEFAULT_SKILLS, heartSlots: cap } }))
    await expect(useCase.execute('p1', 'heartSlots')).rejects.toThrow(/max level/i)
  })

  it('increments heartSlots by 1', async () => {
    await repo.save(makeProfile())
    const updated = await useCase.execute('p1', 'heartSlots')
    expect(updated.skills.heartSlots).toBe(1)
  })

  it('decrements skillPoints by 1', async () => {
    await repo.save(makeProfile({ skillPoints: 3 }))
    const updated = await useCase.execute('p1', 'heartSlots')
    expect(updated.skillPoints).toBe(2)
  })

  it('persists the upgrade to the repository', async () => {
    await repo.save(makeProfile())
    await useCase.execute('p1', 'heartSlots')
    expect((await repo.findById('p1'))?.skills.heartSlots).toBe(1)
  })

  const allSkills: SkillKey[] = ['heartSlots', 'xpBoostLevel', 'hintsPerRound', 'skipCharges']

  allSkills.forEach(skill => {
    it(`upgrades ${skill} from 0 to 1`, async () => {
      await repo.save(makeProfile())
      const updated = await useCase.execute('p1', skill)
      expect(updated.skills[skill]).toBe(1)
    })
  })

  it('does not affect other skill keys when upgrading one', async () => {
    await repo.save(makeProfile())
    const updated = await useCase.execute('p1', 'xpBoostLevel')
    expect(updated.skills.heartSlots).toBe(0)
    expect(updated.skills.hintsPerRound).toBe(0)
    expect(updated.skills.skipCharges).toBe(0)
  })

  it('allows upgrading to max level over multiple purchases', async () => {
    const cap = SKILL_CAPS.xpBoostLevel
    await repo.save(makeProfile({ skillPoints: cap }))
    let profile = makeProfile({ skillPoints: cap })
    for (let i = 0; i < cap; i++) {
      profile = await useCase.execute('p1', 'xpBoostLevel')
    }
    expect(profile.skills.xpBoostLevel).toBe(cap)
  })
})
