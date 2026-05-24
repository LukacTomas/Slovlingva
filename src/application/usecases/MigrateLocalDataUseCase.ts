/**
 * MigrateLocalDataUseCase — copies a local profile to Firestore.
 *
 * Called when a local-only user "upgrades" to a Firebase account.
 * Local data always wins over any existing Firestore data.
 *
 * Steps:
 *   1. Read the local profile
 *   2. Write it to Firestore under the new Firebase uid
 *   3. Delete the local profile from localStorage
 */
import type { IProfileRepository } from '../../domain/ports/IProfileRepository'
import type { IProfile } from '../../domain/entities/profile.entity'

export class MigrateLocalDataUseCase {
  private readonly localRepo: IProfileRepository
  private readonly firestoreRepo: IProfileRepository

  constructor(localRepo: IProfileRepository, firestoreRepo: IProfileRepository) {
    this.localRepo = localRepo
    this.firestoreRepo = firestoreRepo
  }

  async execute(localProfileId: string, firebaseUid: string): Promise<IProfile> {
    // 1. Read local profile
    const localProfile = await this.localRepo.findById(localProfileId)
    if (!localProfile) {
      throw new Error('Lokálny profil nebol nájdený')
    }

    // 2. Build the migrated profile (new id = Firebase uid, drop pinHash)
    const { pinHash: _pin, ...profileData } = localProfile
    const migratedProfile: IProfile = {
      ...profileData,
      id: firebaseUid,
    }

    // 3. Write to Firestore (local data wins — overwrites any existing doc)
    await this.firestoreRepo.save(migratedProfile)

    // 4. Delete from localStorage (only after Firestore write succeeds)
    await this.localRepo.delete(localProfileId)

    return migratedProfile
  }
}
