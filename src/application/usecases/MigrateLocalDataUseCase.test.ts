import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MigrateLocalDataUseCase } from './MigrateLocalDataUseCase'
import type { IProfileRepository } from '../../domain/ports/IProfileRepository'
import type { IProfile } from '../../domain/entities/profile.entity'
import { DEFAULT_SKILLS } from '../../domain/entities/skill.entity'

const localProfile: IProfile = {
  id: 'local-1',
  name: 'Janko',
  avatarIndex: 3,
  totalXP: 1200,
  level: 5,
  skillPoints: 3,
  skills: { ...DEFAULT_SKILLS, heartSlots: 1 },
  gamesPlayed: 25,
  totalCorrect: 200,
  totalAttempts: 250,
  streak: 7,
  lastPlayedDate: '2026-05-23',
  createdAt: '2026-01-15T10:00:00.000Z',
  pinHash: 'abc123hash',
}

function createMockRepo(profile: IProfile | null = localProfile): IProfileRepository {
  return {
    findAll: vi.fn().mockResolvedValue(profile ? [profile] : []),
    findById: vi.fn().mockResolvedValue(profile),
    save: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    getActiveId: vi.fn().mockResolvedValue(null),
    setActiveId: vi.fn().mockResolvedValue(undefined),
  }
}

describe('MigrateLocalDataUseCase', () => {
  let localRepo: IProfileRepository
  let firestoreRepo: IProfileRepository
  let useCase: MigrateLocalDataUseCase

  beforeEach(() => {
    localRepo = createMockRepo(localProfile)
    firestoreRepo = createMockRepo(null)
    useCase = new MigrateLocalDataUseCase(localRepo, firestoreRepo)
  })

  it('copies local profile to Firestore with the new uid', async () => {
    const result = await useCase.execute('local-1', 'firebase-uid-99')

    expect(result.id).toBe('firebase-uid-99')
    expect(result.name).toBe('Janko')
    expect(result.totalXP).toBe(1200)
    expect(result.level).toBe(5)
    expect(result.skills.heartSlots).toBe(1)
  })

  it('drops pinHash from the migrated profile', async () => {
    const result = await useCase.execute('local-1', 'firebase-uid-99')

    expect(result.pinHash).toBeUndefined()
  })

  it('writes to Firestore repo', async () => {
    await useCase.execute('local-1', 'firebase-uid-99')

    expect(firestoreRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'firebase-uid-99', name: 'Janko' })
    )
  })

  it('deletes the local profile after Firestore write', async () => {
    await useCase.execute('local-1', 'firebase-uid-99')

    expect(localRepo.delete).toHaveBeenCalledWith('local-1')
    // Delete is called after save
    const saveOrder = vi.mocked(firestoreRepo.save).mock.invocationCallOrder[0]
    const deleteOrder = vi.mocked(localRepo.delete).mock.invocationCallOrder[0]
    expect(deleteOrder).toBeGreaterThan(saveOrder)
  })

  it('throws when local profile not found', async () => {
    localRepo = createMockRepo(null)
    useCase = new MigrateLocalDataUseCase(localRepo, firestoreRepo)

    await expect(useCase.execute('nonexistent', 'firebase-uid-99'))
      .rejects.toThrow('Lokálny profil nebol nájdený')
  })

  it('preserves all progress fields', async () => {
    const result = await useCase.execute('local-1', 'firebase-uid-99')

    expect(result.gamesPlayed).toBe(25)
    expect(result.totalCorrect).toBe(200)
    expect(result.totalAttempts).toBe(250)
    expect(result.streak).toBe(7)
    expect(result.lastPlayedDate).toBe('2026-05-23')
    expect(result.createdAt).toBe('2026-01-15T10:00:00.000Z')
    expect(result.skillPoints).toBe(3)
  })
})
