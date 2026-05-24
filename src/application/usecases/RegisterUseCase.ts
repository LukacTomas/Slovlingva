/**
 * RegisterUseCase — registers a new Firebase user with a unique username.
 *
 * Steps:
 *   1. Validate username and password
 *   2. Check username uniqueness via IUsernameRegistry
 *   3. Create Firebase Auth user (email = real parent email or synthetic)
 *   4. Write Firestore profile doc at /users/{uid}
 *   5. Write Firestore username lookup at /usernames/{username}
 *   6. Return the created profile
 */
import type { IAuthService, IUsernameRegistry, IRegisterResult } from '../../domain/ports/IAuthService'
import type { IProfileRepository } from '../../domain/ports/IProfileRepository'
import type { IProfile } from '../../domain/entities/profile.entity'
import { DEFAULT_SKILLS } from '../../domain/entities/skill.entity'
import { validateUsername, validatePassword, usernameToEmail } from '../../infrastructure/firebase/authHelpers'

export interface IRegisterInput {
  username: string
  password: string
  avatarIndex: number
  /** Real parent email for password recovery. If omitted, synthetic email is used. */
  recoveryEmail?: string
}

export class RegisterUseCase {
  private readonly authService: IAuthService
  private readonly profileRepo: IProfileRepository
  private readonly usernameRegistry: IUsernameRegistry

  constructor(authService: IAuthService, profileRepo: IProfileRepository, usernameRegistry: IUsernameRegistry) {
    this.authService = authService
    this.profileRepo = profileRepo
    this.usernameRegistry = usernameRegistry
  }

  async execute(input: IRegisterInput): Promise<IRegisterResult> {
    const { username, password, avatarIndex, recoveryEmail } = input

    // 1. Validate
    const usernameError = validateUsername(username)
    if (usernameError) throw new Error(usernameError)

    const passwordError = validatePassword(password)
    if (passwordError) throw new Error(passwordError)

    // 2. Check username uniqueness
    const taken = await this.usernameRegistry.isUsernameTaken(username)
    if (taken) throw new Error(`Meno '${username}' je už obsadené. Skús iné.`)

    // 3. Create Firebase Auth user
    // Use the real recovery email if provided, otherwise synthetic email
    const authEmail = recoveryEmail || usernameToEmail(username)
    const uid = await this.authService.register(authEmail, password)

    try {
      // 4. Write profile to Firestore
      const now = new Date().toISOString()
      const profile: IProfile = {
        id: uid,
        name: username,
        avatarIndex,
        totalXP: 0,
        level: 1,
        skillPoints: 0,
        skills: { ...DEFAULT_SKILLS },
        gamesPlayed: 0,
        totalCorrect: 0,
        totalAttempts: 0,
        streak: 0,
        lastPlayedDate: '',
        createdAt: now,
      }
      await this.profileRepo.save(profile)

      // 5. Register username lookup
      await this.usernameRegistry.registerUsername(username, uid, recoveryEmail ?? null)

      return { uid, profile }
    } catch (error) {
      // Rollback: if Firestore writes fail, we can't easily delete the Auth user
      // from the client side. Log the error — the orphaned Auth user is harmless.
      console.error('Failed to write profile/username after auth registration:', error)
      throw error
    }
  }
}
