import { create } from 'zustand'
import type { IMathExercise, IMathGameConfig, IMathGameState } from '../../domain/entities/math-exercise.entity'
import type { IRoundResult } from '../../domain/entities/game.entity'
import type { FailReason, IFailedExerciseRecord } from '../../domain/entities/game-session.entity'
import { profileRepo } from '../../infrastructure/container'
import { StartMathRoundUseCase } from '../../application/usecases/StartMathRoundUseCase'
import { SubmitMathAnswerUseCase } from '../../application/usecases/SubmitMathAnswerUseCase'
import { FinaliseRoundUseCase } from '../../application/usecases/FinaliseRoundUseCase'

/** Helper: record a failure for the current exercise if not already recorded. */
function recordFailure(
  gameState: IMathGameState | null,
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

interface MathGameStoreState {
  exercises: IMathExercise[]
  gameState: IMathGameState | null
  lastRoundResult: IRoundResult | null
  /** Tracks which exercises the player answered correctly (by exercise id). */
  answeredCorrectly: Set<string>
  failedIndices: Map<number, FailReason>

  startRound: (config: IMathGameConfig) => void
  submitAnswer: (exerciseId: string, answer: number) => { correct: boolean }
  loseHeart: () => void
  nextExercise: () => void
  finaliseRound: (timerBonus: boolean) => Promise<IRoundResult>
  resetGame: () => void
  tick: () => void
  applyHint: (exerciseId: string) => void
  applySkip: () => void
  /** Mark current exercise as failed with a reason (e.g. timer expiry). */
  markFailed: (reason: FailReason) => void
  /** Get the failed exercise records for the session store. */
  getFailedRecords: () => IFailedExerciseRecord[]
}

export const useMathGameStore = create<MathGameStoreState>((set, get) => ({
  exercises: [],
  gameState: null,
  lastRoundResult: null,
  answeredCorrectly: new Set(),
  failedIndices: new Map(),

  startRound: (config) => {
    const { exercises, gameState } = new StartMathRoundUseCase().execute(config)
    set({ exercises, gameState, lastRoundResult: null, answeredCorrectly: new Set(), failedIndices: new Map() })
  },

  submitAnswer: (exerciseId, answer) => {
    const { exercises } = get()
    const exercise = exercises.find(e => e.id === exerciseId)
    if (!exercise) throw new Error(`Math exercise not found: ${exerciseId}`)

    const { correct } = new SubmitMathAnswerUseCase().execute({ exercise, answer })

    if (correct) {
      set(state => {
        const newCorrect = new Set(state.answeredCorrectly)
        newCorrect.add(exerciseId)
        return {
          answeredCorrectly: newCorrect,
          gameState: state.gameState
            ? { ...state.gameState, totalCorrect: state.gameState.totalCorrect + 1 }
            : null,
        }
      })
    } else {
      // Track wrong answer as failure
      const { gameState: gs, failedIndices } = get()
      const updated = recordFailure(gs, failedIndices, 'wrong')
      if (updated) set({ failedIndices: updated })
    }

    return { correct }
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
          totalAttempts: state.gameState.totalAttempts + 1,
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
    if (!gameState) throw new Error('No active math game state')

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
    set({ exercises: [], gameState: null, lastRoundResult: null, answeredCorrectly: new Set(), failedIndices: new Map() })
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

  applyHint: (exerciseId) => {
    const { exercises, gameState: gs, failedIndices } = get()
    const exercise = exercises.find(e => e.id === exerciseId)
    if (!exercise) return

    // Track hint as failure
    const updated = recordFailure(gs, failedIndices, 'hint')
    if (updated) set({ failedIndices: updated })

    // In math mode, a hint reveals the correct answer — mark it as correct
    set(state => {
      const newCorrect = new Set(state.answeredCorrectly)
      newCorrect.add(exerciseId)
      return {
        answeredCorrectly: newCorrect,
        gameState: state.gameState
          ? {
              ...state.gameState,
              hintsLeft: Math.max(0, state.gameState.hintsLeft - 1),
              totalCorrect: state.gameState.totalCorrect + 1,
            }
          : null,
      }
    })
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
