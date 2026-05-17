import { create } from 'zustand'
import type { ISessionSnapshot } from '../../domain/entities/game-session.entity'

interface SessionStoreState {
  /** Current session snapshot, set when a round ends. */
  snapshot: ISessionSnapshot | null

  /** Write session data when a round ends. Called by subject stores. */
  endRound: (data: ISessionSnapshot) => void

  /** Clear session data. Called when navigating away from round-end. */
  clearSession: () => void
}

export const useSessionStore = create<SessionStoreState>((set) => ({
  snapshot: null,

  endRound: (data) => {
    set({ snapshot: data })
  },

  clearSession: () => {
    set({ snapshot: null })
  },
}))
