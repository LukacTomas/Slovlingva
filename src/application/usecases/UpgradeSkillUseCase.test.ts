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

  it('throws when profile does not exist', () => {
    expect(() => useCase.execute('nonexistent', 'heartSlots')).toThrow(/not found/i)
  })

  it('throws when player has 0 skill points', () => {
    repo.save(makeProfile({ skillPoints: 0 }))
    expect(() => useCase.execute('p1', 'heartSlots')).toThrow(/not enough/i)
  })

  it('throws when skill is already at max level', () => {
    const cap = SKILL_CAPS.heartSlots
    repo.save(makeProfile({ skills: { ...DEFAULT_SKILLS, heartSlots: cap } }))
    expect(() => useCase.execute('p1', 'heartSlots')).toThrow(/max level/i)
  })

  it('increments heartSlots by 1', () => {
    repo.save(makeProfile())
    const updated = useCase.execute('p1', 'heartSlots')
    expect(updated.skills.heartSlots).toBe(1)
  })

  it('decrements skillPoints by 1', () => {
    repo.save(makeProfile({ skillPoints: 3 }))
    const updated = useCase.execute('p1', 'heartSlots')
    expect(updated.skillPoints).toBe(2)
  })

  it('persists the upgrade to the repository', () => {
    repo.save(makeProfile())
    useCase.execute('p1', 'heartSlots')
    expect(repo.findById('p1')?.skills.heartSlots).toBe(1)
  })

  const allSkills: SkillKey[] = ['heartSlots', 'xpBoostLevel', 'hintsPerRound', 'skipCharges']

  allSkills.forEach(skill => {
    it(`upgrades ${skill} from 0 to 1`, () => {
      repo.save(makeProfile())
      const updated = useCase.execute('p1', skill)
      expect(updated.skills[skill]).toBe(1)
    })
  })

  it('does not affect other skill keys when upgrading one', () => {
    repo.save(makeProfile())
    const updated = useCase.execute('p1', 'xpBoostLevel')
    expect(updated.skills.heartSlots).toBe(0)
    expect(updated.skills.hintsPerRound).toBe(0)
    expect(updated.skills.skipCharges).toBe(0)
  })

  it('allows upgrading to max level over multiple purchases', () => {
    const cap = SKILL_CAPS.xpBoostLevel
    repo.save(makeProfile({ skillPoints: cap }))
    let profile = makeProfile({ skillPoints: cap })
    for (let i = 0; i < cap; i++) {
      profile = useCase.execute('p1', 'xpBoostLevel')
    }
    expect(profile.skills.xpBoostLevel).toBe(cap)
  })
})
