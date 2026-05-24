/**
 * Auth store — manages Firebase authentication state.
 *
 * Tracks the Firebase user, provides login/register/logout actions,
 * and handles local-to-Firebase data migration.
 */
import { create } from 'zustand'
import type { IProfile } from '../../domain/entities/profile.entity'
import type { IRegisterInput } from '../../application/usecases/RegisterUseCase'
import {
  hasFirebase,
  getAuthService,
  getFirebaseProfileRepo,
  getUsernameRegistry,
  localProfileRepo,
} from '../../infrastructure/container'
import { RegisterUseCase } from '../../application/usecases/RegisterUseCase'
import { LoginUseCase } from '../../application/usecases/LoginUseCase'
import { ResetPasswordUseCase } from '../../application/usecases/ResetPasswordUseCase'
import { MigrateLocalDataUseCase } from '../../application/usecases/MigrateLocalDataUseCase'

export type AuthMode = 'local' | 'firebase'

interface AuthState {
  /** Whether Firebase is configured in this environment. */
  firebaseAvailable: boolean

  /** Current auth mode — 'firebase' when a Firebase user is signed in. */
  authMode: AuthMode

  /** Firebase user ID when signed in, null otherwise. */
  firebaseUid: string | null

  /** Whether auth state has been resolved (onAuthStateChanged fired). */
  authReady: boolean

  // ── Actions ─────────────────────────────────────────────────────────────

  /** Set auth state after onAuthStateChanged fires. */
  setAuthState: (uid: string | null) => void

  /** Register a new Firebase account. Returns the created profile. */
  register: (input: IRegisterInput) => Promise<IProfile>

  /** Sign in with username + password. Returns the profile. */
  login: (username: string, password: string) => Promise<IProfile>

  /** Sign out of Firebase. */
  logout: () => Promise<void>

  /** Send password reset email for a username. */
  resetPassword: (username: string) => Promise<void>

  /**
   * Migrate a local profile to the current Firebase account.
   * Returns the migrated profile.
   */
  migrateLocalProfile: (localProfileId: string) => Promise<IProfile>

  /** Check if there are local profiles that could be migrated. */
  getLocalProfilesForMigration: () => Promise<IProfile[]>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  firebaseAvailable: hasFirebase(),
  authMode: 'local',
  firebaseUid: null,
  authReady: false,

  setAuthState: (uid) => {
    set({
      firebaseUid: uid,
      authMode: uid ? 'firebase' : 'local',
      authReady: true,
    })
  },

  register: async (input) => {
    const authService = getAuthService()
    const firestoreRepo = getFirebaseProfileRepo()
    const usernameRegistry = getUsernameRegistry()

    const useCase = new RegisterUseCase(authService, firestoreRepo, usernameRegistry)
    const { uid, profile } = await useCase.execute(input)

    set({ firebaseUid: uid, authMode: 'firebase' })
    return profile
  },

  login: async (username, password) => {
    const authService = getAuthService()
    const firestoreRepo = getFirebaseProfileRepo()
    const usernameRegistry = getUsernameRegistry()

    const useCase = new LoginUseCase(authService, firestoreRepo, usernameRegistry)
    const { uid, profile } = await useCase.execute(username, password)

    set({ firebaseUid: uid, authMode: 'firebase' })
    return profile
  },

  logout: async () => {
    const authService = getAuthService()
    await authService.logout()
    set({ firebaseUid: null, authMode: 'local' })
  },

  resetPassword: async (username) => {
    const authService = getAuthService()
    const usernameRegistry = getUsernameRegistry()
    const useCase = new ResetPasswordUseCase(authService, usernameRegistry)
    await useCase.execute(username)
  },

  migrateLocalProfile: async (localProfileId) => {
    const { firebaseUid } = get()
    if (!firebaseUid) throw new Error('Musíš byť prihlásený na migráciu profilu')

    const firestoreRepo = getFirebaseProfileRepo()
    const useCase = new MigrateLocalDataUseCase(localProfileRepo, firestoreRepo)
    return useCase.execute(localProfileId, firebaseUid)
  },

  getLocalProfilesForMigration: async () => {
    return localProfileRepo.findAll()
  },
}))
