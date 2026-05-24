import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LoginUseCase } from './LoginUseCase'
import type { IAuthService, IUsernameRegistry } from '../../domain/ports/IAuthService'
import type { IProfileRepository } from '../../domain/ports/IProfileRepository'
import type { IProfile } from '../../domain/entities/profile.entity'
import { DEFAULT_SKILLS } from '../../domain/entities/skill.entity'

const mockProfile: IProfile = {
  id: 'uid-123',
  name: 'tomas',
  avatarIndex: 0,
  totalXP: 500,
  level: 3,
  skillPoints: 2,
  skills: { ...DEFAULT_SKILLS },
  gamesPlayed: 10,
  totalCorrect: 80,
  totalAttempts: 100,
  streak: 3,
  lastPlayedDate: '2026-05-24',
  createdAt: '2026-01-01T00:00:00.000Z',
}

function createMocks() {
  const authService: IAuthService = {
    register: vi.fn(),
    login: vi.fn().mockResolvedValue('uid-123'),
    logout: vi.fn(),
    resetPassword: vi.fn(),
    getCurrentUserId: vi.fn().mockReturnValue(null),
  }
  const profileRepo: IProfileRepository = {
    findAll: vi.fn(),
    findById: vi.fn().mockResolvedValue(mockProfile),
    save: vi.fn(),
    delete: vi.fn(),
    getActiveId: vi.fn(),
    setActiveId: vi.fn(),
  }
  const usernameRegistry: IUsernameRegistry = {
    isUsernameTaken: vi.fn(),
    getUidByUsername: vi.fn().mockResolvedValue('uid-123'),
    getRecoveryEmailByUsername: vi.fn().mockResolvedValue('parent@example.com'),
    registerUsername: vi.fn(),
    removeUsername: vi.fn(),
  }
  return { authService, profileRepo, usernameRegistry }
}

describe('LoginUseCase', () => {
  let authService: IAuthService
  let profileRepo: IProfileRepository
  let usernameRegistry: IUsernameRegistry
  let useCase: LoginUseCase

  beforeEach(() => {
    const mocks = createMocks()
    authService = mocks.authService
    profileRepo = mocks.profileRepo
    usernameRegistry = mocks.usernameRegistry
    useCase = new LoginUseCase(authService, profileRepo, usernameRegistry)
  })

  it('signs in with recovery email when available', async () => {
    const result = await useCase.execute('tomas', 'heslo123')

    expect(result.uid).toBe('uid-123')
    expect(result.profile).toEqual(mockProfile)
    expect(authService.login).toHaveBeenCalledWith('parent@example.com', 'heslo123')
  })

  it('falls back to synthetic email when no recovery email', async () => {
    vi.mocked(usernameRegistry.getRecoveryEmailByUsername).mockResolvedValue(null)

    await useCase.execute('tomas', 'heslo123')

    expect(authService.login).toHaveBeenCalledWith('tomas@slovlingva.app', 'heslo123')
  })

  it('throws when username not found', async () => {
    vi.mocked(usernameRegistry.getUidByUsername).mockResolvedValue(null)

    await expect(useCase.execute('neexistuje', 'heslo123'))
      .rejects.toThrow('Nesprávne meno alebo heslo')
  })

  it('throws when password is wrong', async () => {
    vi.mocked(authService.login).mockRejectedValue(new Error('auth/wrong-password'))

    await expect(useCase.execute('tomas', 'zle-heslo'))
      .rejects.toThrow('Nesprávne meno alebo heslo')
  })

  it('throws when profile not found in Firestore', async () => {
    vi.mocked(profileRepo.findById).mockResolvedValue(null)

    await expect(useCase.execute('tomas', 'heslo123'))
      .rejects.toThrow('Profil nebol nájdený')
  })
})
