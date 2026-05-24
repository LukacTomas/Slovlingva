/**
 * Firebase implementation of IAuthService.
 */
import type { IAuthService } from '../../domain/ports/IAuthService'
import {
  firebaseRegister,
  firebaseLogin,
  firebaseLogout,
  firebaseResetPassword,
  getCurrentUser,
} from './authHelpers'

export class FirebaseAuthService implements IAuthService {
  async register(email: string, password: string): Promise<string> {
    const user = await firebaseRegister(email, password)
    return user.uid
  }

  async login(email: string, password: string): Promise<string> {
    const user = await firebaseLogin(email, password)
    return user.uid
  }

  async logout(): Promise<void> {
    await firebaseLogout()
  }

  async resetPassword(email: string): Promise<void> {
    await firebaseResetPassword(email)
  }

  getCurrentUserId(): string | null {
    return getCurrentUser()?.uid ?? null
  }
}
