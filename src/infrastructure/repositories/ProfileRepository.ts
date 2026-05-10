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

  private loadStore(): IProfileStore {
    return this.storage.get<IProfileStore>(STORE_KEY) ?? { profiles: [], activeProfileId: null }
  }

  private persistStore(store: IProfileStore): void {
    this.storage.set(STORE_KEY, store)
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

  findAll(): IProfile[] {
    return this.loadStore().profiles.map(p => this.migrateProfile(p))
  }

  findById(id: string): IProfile | null {
    const raw = this.loadStore().profiles.find(p => p.id === id)
    return raw ? this.migrateProfile(raw) : null
  }

  save(profile: IProfile): void {
    const store = this.loadStore()
    const idx = store.profiles.findIndex(p => p.id === profile.id)
    if (idx === -1) {
      store.profiles.push(profile)
    } else {
      store.profiles[idx] = profile
    }
    this.persistStore(store)
  }

  delete(id: string): void {
    const store = this.loadStore()
    store.profiles = store.profiles.filter(p => p.id !== id)
    if (store.activeProfileId === id) store.activeProfileId = null
    this.persistStore(store)
  }

  getActiveId(): string | null {
    return this.loadStore().activeProfileId
  }

  setActiveId(id: string | null): void {
    const store = this.loadStore()
    store.activeProfileId = id
    this.persistStore(store)
  }
}
