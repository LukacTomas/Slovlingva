import type { IProfile } from '../../domain/entities/profile.entity'
import type { IProfileRepository } from '../../domain/ports/IProfileRepository'
import { hashPin, verifyPin } from '../../utils/pinUtils'

export interface ISetPinInput {
  profileId: string
  /** Current PIN — required when the profile already has a PIN set. */
  currentPin?: string
  /** New PIN to set, or null/undefined to remove the PIN. */
  newPin?: string | null
}

export class SetPinUseCase {
  private readonly profileRepository: IProfileRepository

  constructor(profileRepository: IProfileRepository) {
    this.profileRepository = profileRepository
  }

  async execute({ profileId, currentPin, newPin }: ISetPinInput): Promise<IProfile> {
    const profile = await this.profileRepository.findById(profileId)
    if (!profile) throw new Error(`Profile not found: ${profileId}`)

    // If profile already has a PIN, caller must verify the current one
    if (profile.pinHash) {
      if (!currentPin) throw new Error('Current PIN is required')
      if (!verifyPin(currentPin, profile.pinHash)) throw new Error('Incorrect PIN')
    }

    const updated: IProfile = {
      ...profile,
      pinHash: newPin ? hashPin(newPin) : undefined,
    }

    await this.profileRepository.save(updated)
    return updated
  }
}
