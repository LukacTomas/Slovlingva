import type { IProfile, IProfileStore } from '../../domain/entities/profile.entity'
import { DEFAULT_SKILLS } from '../../domain/entities/skill.entity'
import type { IProfileRepository } from '../../domain/ports/IProfileRepository'
import type { IStoragePort } from '../../domain/ports/IStoragePort'

const STORE_KEY = 'slovlingva:profiles'

export class ProfileRepository implements IProfileRepository {
  private readonly storage: IStoragePort

  constructor(storage: IStoragePort) {
    this.storage = storage
  }

  private async loadStore(): Promise<IProfileStore> {
    return await this.storage.get<IProfileStore>(STORE_KEY) ?? { profiles: [], activeProfileId: null }
  }

  private async persistStore(store: IProfileStore): Promise<void> {
    await this.storage.set(STORE_KEY, store)
  }

  /**
   * Fill in fields that did not exist when older profiles were saved to localStorage.
   * Uses `any` cast to handle potentially absent keys in old localStorage data without
   * triggering TS2783 (duplicate key) or false "always defined" complaints.
   */
  private migrateProfile(p: IProfile): IProfile {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const legacy = p as any
    return {
      ...p,
      skillPoints: legacy.skillPoints ?? 0,
      skills: { ...DEFAULT_SKILLS, ...(legacy.skills ?? {}) },
    }
  }

  async findAll(): Promise<IProfile[]> {
    const store = await this.loadStore()
    return store.profiles.map(p => this.migrateProfile(p))
  }

  async findById(id: string): Promise<IProfile | null> {
    const store = await this.loadStore()
    const raw = store.profiles.find(p => p.id === id)
    return raw ? this.migrateProfile(raw) : null
  }

  async save(profile: IProfile): Promise<void> {
    const store = await this.loadStore()
    const idx = store.profiles.findIndex(p => p.id === profile.id)
    if (idx === -1) {
      store.profiles.push(profile)
    } else {
      store.profiles[idx] = profile
    }
    await this.persistStore(store)
  }

  async delete(id: string): Promise<void> {
    const store = await this.loadStore()
    store.profiles = store.profiles.filter(p => p.id !== id)
    if (store.activeProfileId === id) store.activeProfileId = null
    await this.persistStore(store)
  }

  async getActiveId(): Promise<string | null> {
    const store = await this.loadStore()
    return store.activeProfileId
  }

  async setActiveId(id: string | null): Promise<void> {
    const store = await this.loadStore()
    store.activeProfileId = id
    await this.persistStore(store)
  }
}
