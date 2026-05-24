/**
 * Firestore implementation of IProfileRepository.
 *
 * Each Firebase user has one profile document at /users/{uid}.
 * Active profile is determined by Firebase Auth state (no separate activeProfileId).
 */
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore'
import { getFirebaseDb } from './firebase'
import { getCurrentUser } from './authHelpers'
import type { IProfileRepository } from '../../domain/ports/IProfileRepository'
import type { IProfile } from '../../domain/entities/profile.entity'
import type { ISkills } from '../../domain/entities/skill.entity'

const COLLECTION = 'users'

const DEFAULT_SKILLS: ISkills = {
  heartSlots: 0,
  xpBoostLevel: 0,
  hintsPerRound: 0,
  skipCharges: 0,
}

export class FirestoreProfileRepository implements IProfileRepository {
  private get db() {
    return getFirebaseDb()
  }

  async findAll(): Promise<IProfile[]> {
    // In the 1-account-per-profile model, findAll returns just the current user's profile
    const uid = getCurrentUser()?.uid
    if (!uid) return []
    const profile = await this.findById(uid)
    return profile ? [profile] : []
  }

  async findById(id: string): Promise<IProfile | null> {
    const ref = doc(this.db, COLLECTION, id)
    const snap = await getDoc(ref)
    if (!snap.exists()) return null
    return this.toProfile(id, snap.data())
  }

  async save(profile: IProfile): Promise<void> {
    const ref = doc(this.db, COLLECTION, profile.id)
    // Strip the `id` field — it's the document key, not a field
    const { id: _id, ...data } = profile
    await setDoc(ref, data, { merge: true })
  }

  async delete(id: string): Promise<void> {
    const ref = doc(this.db, COLLECTION, id)
    await deleteDoc(ref)
  }

  async getActiveId(): Promise<string | null> {
    return getCurrentUser()?.uid ?? null
  }

  async setActiveId(_id: string | null): Promise<void> {
    // In Firebase mode, active profile is determined by auth state.
    // Logout is handled by the auth service, not the profile repository.
    // This is intentionally a no-op.
  }

  /** Convert a Firestore document to an IProfile, with migration defaults. */
  private toProfile(id: string, data: Record<string, unknown>): IProfile {
    return {
      id,
      name: (data['name'] as string) ?? '',
      avatarIndex: (data['avatarIndex'] as number) ?? 0,
      totalXP: (data['totalXP'] as number) ?? 0,
      level: (data['level'] as number) ?? 1,
      skillPoints: (data['skillPoints'] as number) ?? 0,
      skills: { ...DEFAULT_SKILLS, ...(data['skills'] as Partial<ISkills> | undefined) },
      gamesPlayed: (data['gamesPlayed'] as number) ?? 0,
      totalCorrect: (data['totalCorrect'] as number) ?? 0,
      totalAttempts: (data['totalAttempts'] as number) ?? 0,
      streak: (data['streak'] as number) ?? 0,
      lastPlayedDate: (data['lastPlayedDate'] as string) ?? '',
      createdAt: (data['createdAt'] as string) ?? new Date().toISOString(),
      // No pinHash for Firebase profiles — password replaces PIN
    }
  }
}
