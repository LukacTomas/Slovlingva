import type { IProfile } from '../entities/profile.entity'

export interface IProfileRepository {
  findAll(): Promise<IProfile[]>
  findById(id: string): Promise<IProfile | null>
  save(profile: IProfile): Promise<void>
  delete(id: string): Promise<void>
  getActiveId(): Promise<string | null>
  setActiveId(id: string | null): Promise<void>
}
