import type { IProfileRepository } from '../../domain/ports/IProfileRepository'

export class DeleteProfileUseCase {
  private readonly profileRepository: IProfileRepository

  constructor(profileRepository: IProfileRepository) {
    this.profileRepository = profileRepository
  }

  async execute(id: string): Promise<void> {
    const profile = await this.profileRepository.findById(id)
    if (!profile) throw new Error(`Profile not found: ${id}`)
    await this.profileRepository.delete(id)
  }
}
