import { create } from 'zustand'
import type { IProfile } from '../../domain/entities/profile.entity'
import type { SkillKey } from '../../domain/entities/skill.entity'
import { LocalStorageAdapter } from '../../infrastructure/storage/LocalStorageAdapter'
import { ProfileRepository } from '../../infrastructure/repositories/ProfileRepository'
import { CreateProfileUseCase } from '../../application/usecases/CreateProfileUseCase'
import { SelectProfileUseCase } from '../../application/usecases/SelectProfileUseCase'
import { DeleteProfileUseCase } from '../../application/usecases/DeleteProfileUseCase'
import { UpgradeSkillUseCase } from '../../application/usecases/UpgradeSkillUseCase'

// Infrastructure — constructed once, shared across all store actions
const storage = new LocalStorageAdapter()
const profileRepo = new ProfileRepository(storage)

interface ProfileState {
  profiles: IProfile[]
  activeProfile: IProfile | null

  // Actions
  loadProfiles: () => void
  createProfile: (name: string, avatarIndex: number) => IProfile
  selectProfile: (id: string) => void
  deleteProfile: (id: string) => void
  updateActiveProfile: (patch: Partial<IProfile>) => void
  upgradeSkill: (skill: SkillKey) => void
}

function resolveActive(profiles: IProfile[], activeId: string | null): IProfile | null {
  if (!activeId) return null
  return profiles.find(p => p.id === activeId) ?? null
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profiles: [],
  activeProfile: null,

  loadProfiles: () => {
    const profiles = profileRepo.findAll()
    const activeId = profileRepo.getActiveId()
    set({ profiles, activeProfile: resolveActive(profiles, activeId) })
  },

  createProfile: (name, avatarIndex) => {
    const profile = new CreateProfileUseCase(profileRepo).execute(name, avatarIndex)
    set(state => ({
      profiles: [...state.profiles, profile],
    }))
    return profile
  },

  selectProfile: (id) => {
    new SelectProfileUseCase(profileRepo).execute(id)
    set(state => ({
      activeProfile: resolveActive(state.profiles, id),
    }))
  },

  deleteProfile: (id) => {
    new DeleteProfileUseCase(profileRepo).execute(id)
    set(state => {
      const profiles = state.profiles.filter(p => p.id !== id)
      const activeProfile = state.activeProfile?.id === id ? null : state.activeProfile
      return { profiles, activeProfile }
    })
  },

  updateActiveProfile: (patch) => {
    set(state => {
      if (!state.activeProfile) return {}
      const updated = { ...state.activeProfile, ...patch }
      profileRepo.save(updated)
      return {
        activeProfile: updated,
        profiles: state.profiles.map(p => p.id === updated.id ? updated : p),
      }
    })
  },

  upgradeSkill: (skill) => {
    const { activeProfile } = get()
    if (!activeProfile) return
    try {
      const updated = new UpgradeSkillUseCase(profileRepo).execute(activeProfile.id, skill)
      set(state => ({
        activeProfile: updated,
        profiles: state.profiles.map(p => p.id === updated.id ? updated : p),
      }))
    } catch {
      // Not enough SP or at cap — silently ignore; UI should guard
    }
  },
}))
