/**
 * Firestore implementation of IUsernameRegistry.
 *
 * Uses the /usernames/{username} collection for O(1) lookups.
 * Each document has: { uid: string, recoveryEmail: string | null }
 */
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore'
import { getFirebaseDb } from './firebase'
import type { IUsernameRegistry } from '../../domain/ports/IAuthService'

const COLLECTION = 'usernames'

interface UsernameDoc {
  uid: string
  recoveryEmail: string | null
}

export class FirestoreUsernameRegistry implements IUsernameRegistry {
  private get db() {
    return getFirebaseDb()
  }

  async isUsernameTaken(username: string): Promise<boolean> {
    const ref = doc(this.db, COLLECTION, username.toLowerCase())
    const snap = await getDoc(ref)
    return snap.exists()
  }

  async getUidByUsername(username: string): Promise<string | null> {
    const ref = doc(this.db, COLLECTION, username.toLowerCase())
    const snap = await getDoc(ref)
    if (!snap.exists()) return null
    return (snap.data() as UsernameDoc).uid
  }

  async getRecoveryEmailByUsername(username: string): Promise<string | null> {
    const ref = doc(this.db, COLLECTION, username.toLowerCase())
    const snap = await getDoc(ref)
    if (!snap.exists()) return null
    return (snap.data() as UsernameDoc).recoveryEmail ?? null
  }

  async registerUsername(username: string, uid: string, recoveryEmail: string | null): Promise<void> {
    const key = username.toLowerCase()
    const ref = doc(this.db, COLLECTION, key)

    // Check if already taken
    const snap = await getDoc(ref)
    if (snap.exists()) {
      throw new Error(`Meno '${username}' je už obsadené. Skús iné.`)
    }

    const data: UsernameDoc = { uid, recoveryEmail }
    await setDoc(ref, data)
  }

  async removeUsername(username: string): Promise<void> {
    const ref = doc(this.db, COLLECTION, username.toLowerCase())
    await deleteDoc(ref)
  }
}
