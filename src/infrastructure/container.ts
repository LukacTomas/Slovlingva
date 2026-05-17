/**
 * Composition root — single shared infrastructure instances.
 *
 * All Zustand stores import from here instead of creating their own
 * LocalStorageAdapter / ProfileRepository instances.
 */
import { createStorage } from './storage/storageFactory'
import { ProfileRepository } from './repositories/ProfileRepository'

const storage = createStorage()

export const profileRepo = new ProfileRepository(storage)
