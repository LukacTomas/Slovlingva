import { describe, it, expect, beforeEach } from 'vitest'
import { SetPinUseCase } from './SetPinUseCase'
import { ProfileRepository } from '../../infrastructure/repositories/ProfileRepository'
import { LocalStorageAdapter } from '../../infrastructure/storage/LocalStorageAdapter'
import { DEFAULT_SKILLS } from '../../domain/entities/skill.entity'
import { hashPin, verifyPin } from '../../utils/pinUtils'
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

describe('SetPinUseCase', () => {
  let repo: ProfileRepository
  let useCase: SetPinUseCase

  beforeEach(() => {
    localStorage.clear()
    repo = new ProfileRepository(new LocalStorageAdapter())
    useCase = new SetPinUseCase(repo)
  })

  it('throws when profile does not exist', async () => {
    await expect(useCase.execute({ profileId: 'ghost', newPin: '1234' })).rejects.toThrow(/not found/i)
  })

  it('sets a PIN on a profile that has none', async () => {
    await repo.save(makeProfile())
    const updated = await useCase.execute({ profileId: 'p1', newPin: '1234' })
    expect(updated.pinHash).toBeDefined()
    expect(verifyPin('1234', updated.pinHash!)).toBe(true)
  })

  it('persists the PIN hash to the repository', async () => {
    await repo.save(makeProfile())
    await useCase.execute({ profileId: 'p1', newPin: '5678' })
    const stored = await repo.findById('p1')
    expect(stored?.pinHash).toBeDefined()
    expect(verifyPin('5678', stored!.pinHash!)).toBe(true)
  })

  it('requires current PIN when profile already has one', async () => {
    await repo.save(makeProfile({ pinHash: hashPin('1111') }))
    await expect(useCase.execute({ profileId: 'p1', newPin: '2222' })).rejects.toThrow(/current pin/i)
  })

  it('rejects incorrect current PIN', async () => {
    await repo.save(makeProfile({ pinHash: hashPin('1111') }))
    await expect(useCase.execute({ profileId: 'p1', currentPin: '9999', newPin: '2222' })).rejects.toThrow(/incorrect/i)
  })

  it('changes PIN when current PIN is correct', async () => {
    await repo.save(makeProfile({ pinHash: hashPin('1111') }))
    const updated = await useCase.execute({ profileId: 'p1', currentPin: '1111', newPin: '2222' })
    expect(verifyPin('2222', updated.pinHash!)).toBe(true)
    expect(verifyPin('1111', updated.pinHash!)).toBe(false)
  })

  it('removes PIN when newPin is null', async () => {
    await repo.save(makeProfile({ pinHash: hashPin('1111') }))
    const updated = await useCase.execute({ profileId: 'p1', currentPin: '1111', newPin: null })
    expect(updated.pinHash).toBeUndefined()
  })

  it('removes PIN when newPin is undefined', async () => {
    await repo.save(makeProfile({ pinHash: hashPin('1111') }))
    const updated = await useCase.execute({ profileId: 'p1', currentPin: '1111' })
    expect(updated.pinHash).toBeUndefined()
  })

  it('does not require current PIN when profile has no PIN set', async () => {
    await repo.save(makeProfile())
    // Should not throw even without currentPin
    const updated = await useCase.execute({ profileId: 'p1', newPin: '3333' })
    expect(verifyPin('3333', updated.pinHash!)).toBe(true)
  })
})
