import { create } from 'zustand'
import type { IProfile } from '../../domain/entities/profile.entity'
import type { SkillKey } from '../../domain/entities/skill.entity'
import { profileRepo } from '../../infrastructure/container'
import { CreateProfileUseCase } from '../../application/usecases/CreateProfileUseCase'
import { SelectProfileUseCase } from '../../application/usecases/SelectProfileUseCase'
import { DeleteProfileUseCase } from '../../application/usecases/DeleteProfileUseCase'
import { UpgradeSkillUseCase } from '../../application/usecases/UpgradeSkillUseCase'

interface ProfileState {
  profiles: IProfile[]
  activeProfile: IProfile | null

  // Actions
  loadProfiles: () => Promise<void>
  createProfile: (name: string, avatarIndex: number) => Promise<IProfile>
  selectProfile: (id: string) => Promise<void>
  deleteProfile: (id: string) => Promise<void>
  updateActiveProfile: (patch: Partial<IProfile>) => Promise<void>
  upgradeSkill: (skill: SkillKey) => Promise<void>
}

function resolveActive(profiles: IProfile[], activeId: string | null): IProfile | null {
  if (!activeId) return null
  return profiles.find(p => p.id === activeId) ?? null
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profiles: [],
  activeProfile: null,

  loadProfiles: async () => {
    const profiles = await profileRepo.findAll()
    const activeId = await profileRepo.getActiveId()
    set({ profiles, activeProfile: resolveActive(profiles, activeId) })
  },

  createProfile: async (name, avatarIndex) => {
    const profile = await new CreateProfileUseCase(profileRepo).execute(name, avatarIndex)
    set(state => ({
      profiles: [...state.profiles, profile],
    }))
    return profile
  },

  selectProfile: async (id) => {
    await new SelectProfileUseCase(profileRepo).execute(id)
    set(state => ({
      activeProfile: resolveActive(state.profiles, id),
    }))
  },

  deleteProfile: async (id) => {
    await new DeleteProfileUseCase(profileRepo).execute(id)
    set(state => {
      const profiles = state.profiles.filter(p => p.id !== id)
      const activeProfile = state.activeProfile?.id === id ? null : state.activeProfile
      return { profiles, activeProfile }
    })
  },

  updateActiveProfile: async (patch) => {
    const { activeProfile } = get()
    if (!activeProfile) return
    const updated = { ...activeProfile, ...patch }
    await profileRepo.save(updated)
    set(state => ({
      activeProfile: updated,
      profiles: state.profiles.map(p => p.id === updated.id ? updated : p),
    }))
  },

  upgradeSkill: async (skill) => {
    const { activeProfile } = get()
    if (!activeProfile) return
    try {
      const updated = await new UpgradeSkillUseCase(profileRepo).execute(activeProfile.id, skill)
      set(state => ({
        activeProfile: updated,
        profiles: state.profiles.map(p => p.id === updated.id ? updated : p),
      }))
    } catch {
      // Not enough SP or at cap — silently ignore; UI should guard
    }
  },
}))
