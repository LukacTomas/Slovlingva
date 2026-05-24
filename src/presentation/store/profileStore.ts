import { create } from 'zustand'
import type { IProfile } from '../../domain/entities/profile.entity'
import type { SkillKey } from '../../domain/entities/skill.entity'
import type { IProfileRepository } from '../../domain/ports/IProfileRepository'
import { localProfileRepo, getFirebaseProfileRepo } from '../../infrastructure/container'
import { CreateProfileUseCase } from '../../application/usecases/CreateProfileUseCase'
import { SelectProfileUseCase } from '../../application/usecases/SelectProfileUseCase'
import { DeleteProfileUseCase } from '../../application/usecases/DeleteProfileUseCase'
import { UpgradeSkillUseCase } from '../../application/usecases/UpgradeSkillUseCase'
import { SetPinUseCase } from '../../application/usecases/SetPinUseCase'
import { useAuthStore } from './authStore'

interface ProfileState {
  profiles: IProfile[]
  activeProfile: IProfile | null

  // Actions
  loadProfiles: () => Promise<void>
  createProfile: (name: string, avatarIndex: number, pin?: string) => Promise<IProfile>
  selectProfile: (id: string) => Promise<void>
  logout: () => Promise<void>
  deleteProfile: (id: string) => Promise<void>
  updateActiveProfile: (patch: Partial<IProfile>) => Promise<void>
  upgradeSkill: (skill: SkillKey) => Promise<void>
  setPin: (profileId: string, currentPin?: string, newPin?: string | null) => Promise<void>

  /** Set the active profile directly (used by auth store after Firebase login). */
  setActiveProfile: (profile: IProfile) => void
}

/** Get the correct repository based on current auth mode. */
function getRepo(): IProfileRepository {
  const { authMode } = useAuthStore.getState()
  return authMode === 'firebase' ? getFirebaseProfileRepo() : localProfileRepo
}

function resolveActive(profiles: IProfile[], activeId: string | null): IProfile | null {
  if (!activeId) return null
  return profiles.find(p => p.id === activeId) ?? null
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profiles: [],
  activeProfile: null,

  loadProfiles: async () => {
    const repo = getRepo()
    const profiles = await repo.findAll()
    const activeId = await repo.getActiveId()
    set({ profiles, activeProfile: resolveActive(profiles, activeId) })
  },

  createProfile: async (name, avatarIndex, pin?) => {
    const repo = getRepo()
    const profile = await new CreateProfileUseCase(repo).execute(name, avatarIndex, pin)
    set(state => ({
      profiles: [...state.profiles, profile],
    }))
    return profile
  },

  selectProfile: async (id) => {
    const repo = getRepo()
    await new SelectProfileUseCase(repo).execute(id)
    set(state => ({
      activeProfile: resolveActive(state.profiles, id),
    }))
  },

  logout: async () => {
    // If Firebase user is signed in, sign out of Firebase too
    const { authMode, logout: firebaseLogout } = useAuthStore.getState()
    if (authMode === 'firebase') {
      await firebaseLogout()
    }
    const repo = getRepo()
    await repo.setActiveId(null)
    set({ activeProfile: null, profiles: [] })
  },

  deleteProfile: async (id) => {
    const repo = getRepo()
    await new DeleteProfileUseCase(repo).execute(id)
    set(state => {
      const profiles = state.profiles.filter(p => p.id !== id)
      const activeProfile = state.activeProfile?.id === id ? null : state.activeProfile
      return { profiles, activeProfile }
    })
  },

  updateActiveProfile: async (patch) => {
    const repo = getRepo()
    const { activeProfile } = get()
    if (!activeProfile) return
    const updated = { ...activeProfile, ...patch }
    await repo.save(updated)
    set(state => ({
      activeProfile: updated,
      profiles: state.profiles.map(p => p.id === updated.id ? updated : p),
    }))
  },

  upgradeSkill: async (skill) => {
    const repo = getRepo()
    const { activeProfile } = get()
    if (!activeProfile) return
    try {
      const updated = await new UpgradeSkillUseCase(repo).execute(activeProfile.id, skill)
      set(state => ({
        activeProfile: updated,
        profiles: state.profiles.map(p => p.id === updated.id ? updated : p),
      }))
    } catch {
      // Not enough SP or at cap — silently ignore; UI should guard
    }
  },

  setPin: async (profileId, currentPin?, newPin?) => {
    const repo = getRepo()
    const updated = await new SetPinUseCase(repo).execute({ profileId, currentPin, newPin })
    set(state => ({
      activeProfile: state.activeProfile?.id === updated.id ? updated : state.activeProfile,
      profiles: state.profiles.map(p => p.id === updated.id ? updated : p),
    }))
  },

  setActiveProfile: (profile) => {
    set({
      activeProfile: profile,
      profiles: [profile],
    })
  },
}))
