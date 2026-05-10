import type { IProfileRepository } from '../../domain/ports/IProfileRepository'

export class DeleteProfileUseCase {
  private readonly profileRepository: IProfileRepository

  constructor(profileRepository: IProfileRepository) {
    this.profileRepository = profileRepository
  }

  execute(id: string): void {
    const profile = this.profileRepository.findById(id)
    if (!profile) throw new Error(`Profile not found: ${id}`)
    this.profileRepository.delete(id)
  }
}
