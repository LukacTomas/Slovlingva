import type { IProfile } from '../../domain/entities/profile.entity'
import { SKILL_CAPS, SKILL_SP_COST } from '../../domain/entities/skill.entity'
import type { SkillKey } from '../../domain/entities/skill.entity'
import type { IProfileRepository } from '../../domain/ports/IProfileRepository'

export class UpgradeSkillUseCase {
  private readonly profileRepository: IProfileRepository

  constructor(profileRepository: IProfileRepository) {
    this.profileRepository = profileRepository
  }

  async execute(profileId: string, skill: SkillKey): Promise<IProfile> {
    const profile = await this.profileRepository.findById(profileId)
    if (!profile) throw new Error(`Profile not found: ${profileId}`)

    const currentLevel = profile.skills[skill]
    const cap = SKILL_CAPS[skill]

    if (currentLevel >= cap) {
      throw new Error(`Skill "${skill}" is already at max level (${cap})`)
    }

    if (profile.skillPoints < SKILL_SP_COST) {
      throw new Error(`Not enough skill points (have ${profile.skillPoints}, need ${SKILL_SP_COST})`)
    }

    const updated: IProfile = {
      ...profile,
      skillPoints: profile.skillPoints - SKILL_SP_COST,
      skills: {
        ...profile.skills,
        [skill]: currentLevel + 1,
      },
    }

    await this.profileRepository.save(updated)
    return updated
  }
}
