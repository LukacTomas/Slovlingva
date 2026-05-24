/**
 * LoginUseCase — signs in a user by username + password.
 *
 * Steps:
 *   1. Look up uid from /usernames/{username}
 *   2. Retrieve the auth email (recovery email or synthetic) for sign-in
 *   3. Sign in via Firebase Auth
 *   4. Load and return the user's profile
 */
import type { IAuthService, IUsernameRegistry } from '../../domain/ports/IAuthService'
import type { IProfileRepository } from '../../domain/ports/IProfileRepository'
import type { IProfile } from '../../domain/entities/profile.entity'
import { usernameToEmail } from '../../infrastructure/firebase/authHelpers'

export interface ILoginResult {
  uid: string
  profile: IProfile
}

export class LoginUseCase {
  private readonly authService: IAuthService
  private readonly profileRepo: IProfileRepository
  private readonly usernameRegistry: IUsernameRegistry

  constructor(authService: IAuthService, profileRepo: IProfileRepository, usernameRegistry: IUsernameRegistry) {
    this.authService = authService
    this.profileRepo = profileRepo
    this.usernameRegistry = usernameRegistry
  }

  async execute(username: string, password: string): Promise<ILoginResult> {
    // 1. Look up username
    const uid = await this.usernameRegistry.getUidByUsername(username)
    if (!uid) {
      throw new Error('Nesprávne meno alebo heslo')
    }

    // 2. Get the email used for auth
    // Try recovery email first (it's the real Firebase Auth email when set),
    // fall back to synthetic email
    const recoveryEmail = await this.usernameRegistry.getRecoveryEmailByUsername(username)
    const authEmail = recoveryEmail || usernameToEmail(username)

    // 3. Sign in
    try {
      await this.authService.login(authEmail, password)
    } catch {
      throw new Error('Nesprávne meno alebo heslo')
    }

    // 4. Load profile
    const profile = await this.profileRepo.findById(uid)
    if (!profile) {
      throw new Error('Profil nebol nájdený')
    }

    return { uid, profile }
  }
}
