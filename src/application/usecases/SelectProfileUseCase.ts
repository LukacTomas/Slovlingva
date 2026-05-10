import type { IProfileRepository } from '../../domain/ports/IProfileRepository'

export class SelectProfileUseCase {
  private readonly profileRepository: IProfileRepository

  constructor(profileRepository: IProfileRepository) {
    this.profileRepository = profileRepository
  }

  execute(id: string): void {
    const profile = this.profileRepository.findById(id)
    if (!profile) throw new Error(`Profile not found: ${id}`)
    this.profileRepository.setActiveId(id)
  }
}
