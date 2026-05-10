import { useProfileStore } from '../store/profileStore'

export function useProfile() {
  return useProfileStore()
}
