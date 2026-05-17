import { create } from 'zustand'
import type { IExercise, CharacterOption } from '../../domain/entities/exercise.entity'
import type { IGameConfig, IGameState, IRoundResult } from '../../domain/entities/game.entity'
import type { FailReason, IFailedExerciseRecord } from '../../domain/entities/game-session.entity'
import { DataLoader } from '../../infrastructure/data/DataLoader'
import { profileRepo } from '../../infrastructure/container'
import { StartRoundUseCase } from '../../application/usecases/StartRoundUseCase'
import { SubmitAnswerUseCase } from '../../application/usecases/SubmitAnswerUseCase'
import { FinaliseRoundUseCase } from '../../application/usecases/FinaliseRoundUseCase'

const dataLoader = new DataLoader()

/** Helper: record a failure for the current exercise if not already recorded. */
function recordFailure(
  gameState: IGameState | null,
  failedIndices: Map<number, FailReason>,
  reason: FailReason,
): Map<number, FailReason> | null {
  if (!gameState) return null
  const idx = gameState.currentExerciseIndex
  if (failedIndices.has(idx)) return null
  const updated = new Map(failedIndices)
  updated.set(idx, reason)
  return updated
}

interface GameStoreState {
  exercises: IExercise[]
  gameState: IGameState | null
  lastRoundResult: IRoundResult | null
  failedIndices: Map<number, FailReason>
  dataReady: boolean

  loadData: () => Promise<void>
  startRound: (config: IGameConfig) => void
  fillBlank: (exerciseId: string, blankId: string, char: CharacterOption) => { correct: boolean; allResolved: boolean }
  resetBlank: (exerciseId: string, blankId: string) => void
  loseHeart: () => void
  nextExercise: () => void
  finaliseRound: (timerBonus: boolean) => Promise<IRoundResult>
  resetGame: () => void
  tick: () => void
  applyHint: (exerciseId: string, blankId: string) => { allResolved: boolean }
  applySkip: () => void
  /** Mark current exercise as failed with a reason (e.g. timer expiry). */
  markFailed: (reason: FailReason) => void
  /** Get the failed exercise records for the session store. */
  getFailedRecords: () => IFailedExerciseRecord[]
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  exercises: [],
  gameState: null,
  lastRoundResult: null,
  failedIndices: new Map(),
  dataReady: false,

  loadData: async () => {
    await dataLoader.load()
    set({ dataReady: true })
  },

  startRound: (config) => {
    const { exercises, gameState } = new StartRoundUseCase(dataLoader).execute(config)
    set({ exercises, gameState, lastRoundResult: null, failedIndices: new Map() })
  },

  fillBlank: (exerciseId, blankId, char) => {
    const { exercises } = get()
    const exercise = exercises.find(e => e.id === exerciseId)
    if (!exercise) throw new Error(`Exercise not found: ${exerciseId}`)

    const { correct, updatedExercise, allBlanksResolved } =
      new SubmitAnswerUseCase().execute({ exercise, blankId, char })

    set(state => ({
      exercises: state.exercises.map(e => e.id === exerciseId ? updatedExercise : e),
    }))

    // Track failure on wrong answer
    if (!correct) {
      const { gameState: gs, failedIndices } = get()
      const updated = recordFailure(gs, failedIndices, 'wrong')
      if (updated) set({ failedIndices: updated })
    }

    return { correct, allResolved: allBlanksResolved }
  },

  resetBlank: (exerciseId, blankId) => {
    set(state => ({
      exercises: state.exercises.map(e =>
        e.id === exerciseId
          ? {
              ...e,
              blanks: e.blanks.map(b =>
                b.id === blankId
                  ? { ...b, filledChar: null, state: 'empty' as const }
                  : b
              ),
            }
          : e
      ),
    }))
  },

  loseHeart: () => {
    set(state => {
      if (!state.gameState) return {}
      const hearts = state.gameState.hearts - 1
      return {
        gameState: {
          ...state.gameState,
          hearts,
          status: hearts <= 0 ? 'game_over' as const : 'playing' as const,
        },
      }
    })
  },

  nextExercise: () => {
    set(state => {
      if (!state.gameState) return {}
      const nextIndex = state.gameState.currentExerciseIndex + 1
      const isLast = nextIndex >= state.exercises.length
      return {
        gameState: {
          ...state.gameState,
          currentExerciseIndex: nextIndex,
          status: isLast ? 'round_end' as const : 'playing' as const,
          timerSecondsLeft: state.gameState.config.timerEnabled
            ? state.gameState.config.secondsPerExercise
            : 0,
        },
      }
    })
  },

  finaliseRound: async (timerBonus) => {
    const { gameState, exercises, failedIndices } = get()
    if (!gameState) throw new Error('No active game state')

    // Count at exercise level: exercises without any failure = correct
    const totalExercises = exercises.length
    const correctCount = totalExercises - failedIndices.size

    const result = await new FinaliseRoundUseCase(profileRepo).execute({
      correctCount,
      totalBlanks: totalExercises,
      timerBonus,
    })

    set({ lastRoundResult: result })
    return result
  },

  resetGame: () => {
    set({ exercises: [], gameState: null, lastRoundResult: null, failedIndices: new Map() })
  },

  tick: () => {
    set(state => {
      if (!state.gameState?.config.timerEnabled) return {}
      const secs = state.gameState.timerSecondsLeft - 1
      return {
        gameState: {
          ...state.gameState,
          timerSecondsLeft: Math.max(0, secs),
        },
      }
    })
  },

  applyHint: (exerciseId, blankId) => {
    const { exercises, gameState: gs, failedIndices } = get()
    const exercise = exercises.find(e => e.id === exerciseId)
    if (!exercise) return { allResolved: false }

    const blank = exercise.blanks.find(b => b.id === blankId)
    if (!blank || blank.state === 'correct') return { allResolved: false }

    // Track hint as failure
    const updated = recordFailure(gs, failedIndices, 'hint')
    if (updated) set({ failedIndices: updated })

    // Fill the blank with the correct character and mark it correct
    const updatedBlanks = exercise.blanks.map(b =>
      b.id === blankId
        ? { ...b, filledChar: b.correctChar, state: 'correct' as const }
        : b
    )
    const allResolved = updatedBlanks.every(b => b.state === 'correct')

    set(state => ({
      exercises: state.exercises.map(e =>
        e.id === exerciseId ? { ...e, blanks: updatedBlanks } : e
      ),
      gameState: state.gameState
        ? { ...state.gameState, hintsLeft: Math.max(0, state.gameState.hintsLeft - 1) }
        : null,
    }))

    return { allResolved }
  },

  applySkip: () => {
    // Track skip as failure
    const { gameState: gs, failedIndices } = get()
    const updated = recordFailure(gs, failedIndices, 'skipped')
    if (updated) set({ failedIndices: updated })

    set(state => {
      if (!state.gameState) return {}
      const nextIndex = state.gameState.currentExerciseIndex + 1
      const isLast = nextIndex >= state.exercises.length
      return {
        gameState: {
          ...state.gameState,
          currentExerciseIndex: nextIndex,
          skipsLeft: Math.max(0, state.gameState.skipsLeft - 1),
          status: isLast ? 'round_end' as const : 'playing' as const,
          timerSecondsLeft: state.gameState.config.timerEnabled
            ? state.gameState.config.secondsPerExercise
            : 0,
        },
      }
    })
  },

  markFailed: (reason) => {
    const { gameState: gs, failedIndices } = get()
    const updated = recordFailure(gs, failedIndices, reason)
    if (updated) set({ failedIndices: updated })
  },

  getFailedRecords: () => {
    const { failedIndices } = get()
    return Array.from(failedIndices.entries())
      .sort(([a], [b]) => a - b)
      .map(([exerciseIndex, reason]) => ({ exerciseIndex, reason }))
  },
}))
