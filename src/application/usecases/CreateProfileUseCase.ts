import type { IProfile } from '../../domain/entities/profile.entity'
import { DEFAULT_SKILLS } from '../../domain/entities/skill.entity'
import type { IProfileRepository } from '../../domain/ports/IProfileRepository'
import { hashPin } from '../../utils/pinUtils'

export class CreateProfileUseCase {
  private readonly profileRepository: IProfileRepository

  constructor(profileRepository: IProfileRepository) {
    this.profileRepository = profileRepository
  }

  async execute(name: string, avatarIndex: number, pin?: string): Promise<IProfile> {
    const profile: IProfile = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name,
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
      createdAt: new Date().toISOString(),
      ...(pin ? { pinHash: hashPin(pin) } : {}),
    }
    await this.profileRepository.save(profile)
    return profile
  }
}
