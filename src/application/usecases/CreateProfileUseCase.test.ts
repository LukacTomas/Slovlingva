import { describe, it, expect, beforeEach } from 'vitest'
import { CreateProfileUseCase } from './CreateProfileUseCase'
import { ProfileRepository } from '../../infrastructure/repositories/ProfileRepository'
import { LocalStorageAdapter } from '../../infrastructure/storage/LocalStorageAdapter'
import { verifyPin } from '../../utils/pinUtils'

describe('CreateProfileUseCase', () => {
  let useCase: CreateProfileUseCase

  beforeEach(() => {
    localStorage.clear()
    useCase = new CreateProfileUseCase(new ProfileRepository(new LocalStorageAdapter()))
  })

  it('returns a profile with the given name and avatarIndex', async () => {
    const p = await useCase.execute('Alice', 2)
    expect(p.name).toBe('Alice')
    expect(p.avatarIndex).toBe(2)
  })

  it('assigns a unique id each time', async () => {
    const a = await useCase.execute('Alice', 0)
    const b = await useCase.execute('Bob', 1)
    expect(a.id).not.toBe(b.id)
  })

  it('initialises all stats to zero / defaults', async () => {
    const p = await useCase.execute('Alice', 0)
    expect(p.totalXP).toBe(0)
    expect(p.level).toBe(1)
    expect(p.gamesPlayed).toBe(0)
    expect(p.totalCorrect).toBe(0)
    expect(p.totalAttempts).toBe(0)
    expect(p.streak).toBe(0)
  })

  it('initialises skillPoints to 0', async () => {
    const p = await useCase.execute('Alice', 0)
    expect(p.skillPoints).toBe(0)
  })

  it('initialises all skill levels to 0', async () => {
    const p = await useCase.execute('Alice', 0)
    expect(p.skills.heartSlots).toBe(0)
    expect(p.skills.xpBoostLevel).toBe(0)
    expect(p.skills.hintsPerRound).toBe(0)
    expect(p.skills.skipCharges).toBe(0)
  })

  it('persists the profile to the repository', async () => {
    await useCase.execute('Alice', 0)
    const repo = new ProfileRepository(new LocalStorageAdapter())
    expect(await repo.findAll()).toHaveLength(1)
  })

  it('creates profile without PIN when pin is omitted', async () => {
    const p = await useCase.execute('Alice', 0)
    expect(p.pinHash).toBeUndefined()
  })

  it('creates profile with PIN hash when pin is provided', async () => {
    const p = await useCase.execute('Alice', 0, '1234')
    expect(p.pinHash).toBeDefined()
    expect(verifyPin('1234', p.pinHash!)).toBe(true)
  })

  it('rejects invalid PIN format', async () => {
    await expect(useCase.execute('Alice', 0, 'abc')).rejects.toThrow(/4 digits/)
  })
})
