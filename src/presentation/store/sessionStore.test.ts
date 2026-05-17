import { describe, it, expect, beforeEach } from 'vitest'
import { useSessionStore } from './sessionStore'
import type { ISessionSnapshot } from '../../domain/entities/game-session.entity'
import type { IRoundResult } from '../../domain/entities/game.entity'

function makeResult(overrides?: Partial<IRoundResult>): IRoundResult {
  return {
    xpEarned: 10,
    accuracy: 0.8,
    correctCount: 4,
    totalBlanks: 5,
    leveledUp: false,
    newLevel: 1,
    skillPointsEarned: 0,
    streak: 1,
    streakIncreased: false,
    ...overrides,
  }
}

function makeSnapshot(overrides?: Partial<ISessionSnapshot>): ISessionSnapshot {
  return {
    subject: 'slovencina',
    routes: { setupPage: 'game-setup', gamePage: 'game' },
    lastRoundResult: makeResult(),
    gameStatus: 'round_end',
    failedExercises: [{ exerciseIndex: 0, reason: 'wrong' }],
    replayExercises: [{ id: 'ex-1' }],
    rendererKey: 'slovencina',
    gameConfig: {},
    restartRound: () => {},
    resetGame: () => {},
    ...overrides,
  }
}

describe('sessionStore', () => {
  beforeEach(() => {
    useSessionStore.getState().clearSession()
  })

  it('starts with null snapshot', () => {
    expect(useSessionStore.getState().snapshot).toBeNull()
  })

  it('endRound stores the snapshot', () => {
    const snap = makeSnapshot()
    useSessionStore.getState().endRound(snap)
    expect(useSessionStore.getState().snapshot).toEqual(snap)
  })

  it('endRound overwrites previous snapshot', () => {
    const snap1 = makeSnapshot({ subject: 'slovencina' })
    const snap2 = makeSnapshot({ subject: 'matematika' })
    useSessionStore.getState().endRound(snap1)
    useSessionStore.getState().endRound(snap2)
    expect(useSessionStore.getState().snapshot?.subject).toBe('matematika')
  })

  it('clearSession resets snapshot to null', () => {
    useSessionStore.getState().endRound(makeSnapshot())
    expect(useSessionStore.getState().snapshot).not.toBeNull()
    useSessionStore.getState().clearSession()
    expect(useSessionStore.getState().snapshot).toBeNull()
  })

  it('stores failedExercises data correctly', () => {
    const failed = [
      { exerciseIndex: 1, reason: 'wrong' as const },
      { exerciseIndex: 3, reason: 'skipped' as const },
      { exerciseIndex: 5, reason: 'timeout' as const },
    ]
    useSessionStore.getState().endRound(makeSnapshot({ failedExercises: failed }))
    expect(useSessionStore.getState().snapshot?.failedExercises).toEqual(failed)
  })

  it('stores routes for subject-agnostic navigation', () => {
    useSessionStore.getState().endRound(makeSnapshot({
      routes: { setupPage: 'math-setup', gamePage: 'math-game' },
    }))
    const routes = useSessionStore.getState().snapshot?.routes
    expect(routes?.setupPage).toBe('math-setup')
    expect(routes?.gamePage).toBe('math-game')
  })
})
