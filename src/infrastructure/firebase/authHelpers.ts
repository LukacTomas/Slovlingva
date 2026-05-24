/**
 * Firebase Auth helpers.
 *
 * Wraps Firebase Auth SDK calls behind a clean interface.
 * Username is mapped to email via `usernameToEmail()`.
 */
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  type User,
  type Unsubscribe,
} from 'firebase/auth'
import { getFirebaseAuth } from './firebase'

const EMAIL_DOMAIN = 'slovlingva.app'

/** Convert a username to the synthetic Firebase Auth email. */
export function usernameToEmail(username: string): string {
  return `${username.toLowerCase().trim()}@${EMAIL_DOMAIN}`
}

/** Validate username format: 3-20 alphanumeric characters, hyphens, underscores. */
export function validateUsername(username: string): string | null {
  const trimmed = username.trim()
  if (trimmed.length < 3) return 'Meno musí mať aspoň 3 znaky'
  if (trimmed.length > 20) return 'Meno môže mať najviac 20 znakov'
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) return 'Meno môže obsahovať len písmená, čísla, _ a -'
  return null
}

/** Validate password: min 6 characters (Firebase minimum). */
export function validatePassword(password: string): string | null {
  if (password.length < 6) return 'Heslo musí mať aspoň 6 znakov'
  return null
}

/**
 * Register a new Firebase user.
 * Note: This only creates the Auth user. Firestore profile + username doc
 * are written by RegisterUseCase as a batch.
 */
export async function firebaseRegister(email: string, password: string): Promise<User> {
  const { user } = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password)
  return user
}

/** Sign in with email and password. */
export async function firebaseLogin(email: string, password: string): Promise<User> {
  const { user } = await signInWithEmailAndPassword(getFirebaseAuth(), email, password)
  return user
}

/** Sign out the current user. */
export async function firebaseLogout(): Promise<void> {
  await signOut(getFirebaseAuth())
}

/** Send a password reset email. */
export async function firebaseResetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(getFirebaseAuth(), email)
}

/** Subscribe to auth state changes. Returns an unsubscribe function. */
export function onFirebaseAuthChange(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(getFirebaseAuth(), callback)
}

/** Get the currently signed-in user (synchronous snapshot). */
export function getCurrentUser(): User | null {
  return getFirebaseAuth().currentUser
}
