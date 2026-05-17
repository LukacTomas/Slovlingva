import type { IStoragePort } from '../../domain/ports/IStoragePort'
import { LocalStorageAdapter } from './LocalStorageAdapter'

/**
 * Creates the storage adapter based on the VITE_STORAGE_BACKEND environment variable.
 *
 * Supported values:
 *   'local'    — localStorage (default, offline)
 *   'firebase' — Firestore (future)
 *   'rest'     — custom REST API (future)
 */
export function createStorage(): IStoragePort {
  const backend = import.meta.env.VITE_STORAGE_BACKEND ?? 'local'

  switch (backend) {
    // Future backends:
    // case 'firebase': return new FirebaseStorageAdapter()
    // case 'rest':     return new RestStorageAdapter()
    case 'local':
    default:
      return new LocalStorageAdapter()
  }
}
