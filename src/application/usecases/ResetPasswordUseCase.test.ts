import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ResetPasswordUseCase } from './ResetPasswordUseCase'
import type { IAuthService, IUsernameRegistry } from '../../domain/ports/IAuthService'

function createMocks() {
  const authService: IAuthService = {
    register: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    resetPassword: vi.fn().mockResolvedValue(undefined),
    getCurrentUserId: vi.fn().mockReturnValue(null),
  }
  const usernameRegistry: IUsernameRegistry = {
    isUsernameTaken: vi.fn(),
    getUidByUsername: vi.fn(),
    getRecoveryEmailByUsername: vi.fn().mockResolvedValue('parent@example.com'),
    registerUsername: vi.fn(),
    removeUsername: vi.fn(),
  }
  return { authService, usernameRegistry }
}

describe('ResetPasswordUseCase', () => {
  let authService: IAuthService
  let usernameRegistry: IUsernameRegistry
  let useCase: ResetPasswordUseCase

  beforeEach(() => {
    const mocks = createMocks()
    authService = mocks.authService
    usernameRegistry = mocks.usernameRegistry
    useCase = new ResetPasswordUseCase(authService, usernameRegistry)
  })

  it('sends a reset email to the recovery address', async () => {
    await useCase.execute('tomas')

    expect(usernameRegistry.getRecoveryEmailByUsername).toHaveBeenCalledWith('tomas')
    expect(authService.resetPassword).toHaveBeenCalledWith('parent@example.com')
  })

  it('throws when no recovery email is set', async () => {
    vi.mocked(usernameRegistry.getRecoveryEmailByUsername).mockResolvedValue(null)

    await expect(useCase.execute('tomas'))
      .rejects.toThrow('nie je nastavený e-mail')
  })
})
