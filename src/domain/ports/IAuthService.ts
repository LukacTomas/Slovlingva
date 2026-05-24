import type { IProfile } from '../entities/profile.entity'

/**
 * Auth service port — abstracts Firebase Auth behind a domain interface.
 *
 * Use cases depend on this interface, not on Firebase directly.
 * This allows testing with mocks and future auth provider swaps.
 */
export interface IAuthService {
  /** Register a new user. Returns the user's unique ID. */
  register(email: string, password: string): Promise<string>

  /** Sign in an existing user. Returns the user's unique ID. */
  login(email: string, password: string): Promise<string>

  /** Sign out the current user. */
  logout(): Promise<void>

  /** Send a password reset email. */
  resetPassword(email: string): Promise<void>

  /** Get the currently authenticated user's ID, or null. */
  getCurrentUserId(): string | null
}

/**
 * Username registry port — manages the username ↔ uid lookup.
 *
 * Backed by Firestore `/usernames/{username}` collection.
 */
export interface IUsernameRegistry {
  /** Check if a username is already taken. */
  isUsernameTaken(username: string): Promise<boolean>

  /** Look up the uid for a given username. Returns null if not found. */
  getUidByUsername(username: string): Promise<string | null>

  /** Look up the recovery email for a given username. Returns null if not found. */
  getRecoveryEmailByUsername(username: string): Promise<string | null>

  /** Reserve a username for a uid. Throws if already taken. */
  registerUsername(username: string, uid: string, recoveryEmail: string | null): Promise<void>

  /** Remove a username reservation. */
  removeUsername(username: string): Promise<void>
}

/** Result of a successful registration. */
export interface IRegisterResult {
  uid: string
  profile: IProfile
}
