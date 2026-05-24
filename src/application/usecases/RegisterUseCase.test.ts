import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RegisterUseCase } from './RegisterUseCase'
import type { IAuthService, IUsernameRegistry } from '../../domain/ports/IAuthService'
import type { IProfileRepository } from '../../domain/ports/IProfileRepository'

function createMockAuthService(): IAuthService {
  return {
    register: vi.fn().mockResolvedValue('uid-123'),
    login: vi.fn().mockResolvedValue('uid-123'),
    logout: vi.fn().mockResolvedValue(undefined),
    resetPassword: vi.fn().mockResolvedValue(undefined),
    getCurrentUserId: vi.fn().mockReturnValue(null),
  }
}

function createMockProfileRepo(): IProfileRepository {
  return {
    findAll: vi.fn().mockResolvedValue([]),
    findById: vi.fn().mockResolvedValue(null),
    save: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    getActiveId: vi.fn().mockResolvedValue(null),
    setActiveId: vi.fn().mockResolvedValue(undefined),
  }
}

function createMockUsernameRegistry(): IUsernameRegistry {
  return {
    isUsernameTaken: vi.fn().mockResolvedValue(false),
    getUidByUsername: vi.fn().mockResolvedValue(null),
    getRecoveryEmailByUsername: vi.fn().mockResolvedValue(null),
    registerUsername: vi.fn().mockResolvedValue(undefined),
    removeUsername: vi.fn().mockResolvedValue(undefined),
  }
}

describe('RegisterUseCase', () => {
  let authService: IAuthService
  let profileRepo: IProfileRepository
  let usernameRegistry: IUsernameRegistry
  let useCase: RegisterUseCase

  beforeEach(() => {
    authService = createMockAuthService()
    profileRepo = createMockProfileRepo()
    usernameRegistry = createMockUsernameRegistry()
    useCase = new RegisterUseCase(authService, profileRepo, usernameRegistry)
  })

  it('creates a Firebase user, writes profile, and registers username', async () => {
    const result = await useCase.execute({
      username: 'tomas',
      password: 'heslo123',
      avatarIndex: 2,
      recoveryEmail: 'parent@example.com',
    })

    expect(result.uid).toBe('uid-123')
    expect(result.profile.id).toBe('uid-123')
    expect(result.profile.name).toBe('tomas')
    expect(result.profile.avatarIndex).toBe(2)
    expect(result.profile.totalXP).toBe(0)
    expect(result.profile.level).toBe(1)

    // Auth: uses recovery email
    expect(authService.register).toHaveBeenCalledWith('parent@example.com', 'heslo123')

    // Profile saved
    expect(profileRepo.save).toHaveBeenCalledWith(expect.objectContaining({ id: 'uid-123', name: 'tomas' }))

    // Username registered
    expect(usernameRegistry.registerUsername).toHaveBeenCalledWith('tomas', 'uid-123', 'parent@example.com')
  })

  it('uses synthetic email when no recovery email provided', async () => {
    await useCase.execute({
      username: 'janko',
      password: 'heslo123',
      avatarIndex: 0,
    })

    expect(authService.register).toHaveBeenCalledWith('janko@slovlingva.app', 'heslo123')
    expect(usernameRegistry.registerUsername).toHaveBeenCalledWith('janko', 'uid-123', null)
  })

  it('rejects username shorter than 3 characters', async () => {
    await expect(useCase.execute({
      username: 'ab',
      password: 'heslo123',
      avatarIndex: 0,
    })).rejects.toThrow('aspoň 3 znaky')
  })

  it('rejects username longer than 20 characters', async () => {
    await expect(useCase.execute({
      username: 'a'.repeat(21),
      password: 'heslo123',
      avatarIndex: 0,
    })).rejects.toThrow('najviac 20 znakov')
  })

  it('rejects username with special characters', async () => {
    await expect(useCase.execute({
      username: 'tom@s!',
      password: 'heslo123',
      avatarIndex: 0,
    })).rejects.toThrow('len písmená')
  })

  it('rejects password shorter than 6 characters', async () => {
    await expect(useCase.execute({
      username: 'tomas',
      password: '12345',
      avatarIndex: 0,
    })).rejects.toThrow('aspoň 6 znakov')
  })

  it('rejects already taken username', async () => {
    vi.mocked(usernameRegistry.isUsernameTaken).mockResolvedValue(true)

    await expect(useCase.execute({
      username: 'tomas',
      password: 'heslo123',
      avatarIndex: 0,
    })).rejects.toThrow('obsadené')
  })

  it('profile has default skills and no pinHash', async () => {
    const result = await useCase.execute({
      username: 'tomas',
      password: 'heslo123',
      avatarIndex: 0,
    })

    expect(result.profile.skills).toEqual({
      heartSlots: 0,
      xpBoostLevel: 0,
      hintsPerRound: 0,
      skipCharges: 0,
    })
    expect(result.profile.pinHash).toBeUndefined()
  })
})
