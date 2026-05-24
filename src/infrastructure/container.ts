/**
 * Composition root — shared infrastructure instances.
 *
 * Provides both local and Firebase repositories.
 * The active profile repository is selected based on auth state:
 *   - Firebase user signed in → FirestoreProfileRepository
 *   - No Firebase user → ProfileRepository (localStorage)
 */
import { createStorage } from './storage/storageFactory'
import { ProfileRepository } from './repositories/ProfileRepository'
import { isFirebaseConfigured } from './firebase/firebase'
import { FirestoreProfileRepository } from './firebase/FirestoreProfileRepository'
import { FirebaseAuthService } from './firebase/FirebaseAuthService'
import { FirestoreUsernameRegistry } from './firebase/FirestoreUsernameRegistry'

// ── Local storage (always available) ──────────────────────────────────────
const storage = createStorage()
export const localProfileRepo = new ProfileRepository(storage)

// Legacy alias — existing code imports `profileRepo`
export { localProfileRepo as profileRepo }

// ── Firebase services (lazy singleton, only instantiated when needed) ──────

let _firebaseProfileRepo: FirestoreProfileRepository | null = null
let _authService: FirebaseAuthService | null = null
let _usernameRegistry: FirestoreUsernameRegistry | null = null

export function getFirebaseProfileRepo() {
  if (!_firebaseProfileRepo) {
    _firebaseProfileRepo = new FirestoreProfileRepository()
  }
  return _firebaseProfileRepo
}

export function getAuthService() {
  if (!_authService) {
    _authService = new FirebaseAuthService()
  }
  return _authService
}

export function getUsernameRegistry() {
  if (!_usernameRegistry) {
    _usernameRegistry = new FirestoreUsernameRegistry()
  }
  return _usernameRegistry
}

/** Whether Firebase is available in this environment. */
export function hasFirebase(): boolean {
  return isFirebaseConfigured()
}
