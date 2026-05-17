import { describe, it, expect, beforeEach } from 'vitest'
import { DeleteProfileUseCase } from './DeleteProfileUseCase'
import { ProfileRepository } from '../../infrastructure/repositories/ProfileRepository'
import { LocalStorageAdapter } from '../../infrastructure/storage/LocalStorageAdapter'
import { DEFAULT_SKILLS } from '../../domain/entities/skill.entity'
import type { IProfile } from '../../domain/entities/profile.entity'

function makeProfile(id: string): IProfile {
  return {
    id,
    name: 'Test',
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
  }
}

describe('DeleteProfileUseCase', () => {
  let useCase: DeleteProfileUseCase
  let repo: ProfileRepository

  beforeEach(() => {
    localStorage.clear()
    repo = new ProfileRepository(new LocalStorageAdapter())
    useCase = new DeleteProfileUseCase(repo)
  })

  it('removes the profile from the repository', async () => {
    await repo.save(makeProfile('p1'))
    await useCase.execute('p1')
    expect(await repo.findAll()).toHaveLength(0)
  })

  it('throws when profile does not exist', async () => {
    await expect(useCase.execute('ghost')).rejects.toThrow()
  })

  it('clears active id if deleted profile was active', async () => {
    await repo.save(makeProfile('p1'))
    await repo.setActiveId('p1')
    await useCase.execute('p1')
    expect(await repo.getActiveId()).toBeNull()
  })
})
