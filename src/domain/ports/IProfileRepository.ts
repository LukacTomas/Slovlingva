import type { IProfile } from '../entities/profile.entity'

export interface IProfileRepository {
  findAll(): IProfile[]
  findById(id: string): IProfile | null
  save(profile: IProfile): void
  delete(id: string): void
  getActiveId(): string | null
  setActiveId(id: string | null): void
}
