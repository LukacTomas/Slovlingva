import { create } from 'zustand'
import type { IMathExercise, IMathGameConfig, IMathGameState } from '../../domain/entities/math-exercise.entity'
import type { IRoundResult } from '../../domain/entities/game.entity'
import { LocalStorageAdapter } from '../../infrastructure/storage/LocalStorageAdapter'
import { ProfileRepository } from '../../infrastructure/repositories/ProfileRepository'
import { StartMathRoundUseCase } from '../../application/usecases/StartMathRoundUseCase'
import { SubmitMathAnswerUseCase } from '../../application/usecases/SubmitMathAnswerUseCase'
import { FinaliseRoundUseCase } from '../../application/usecases/FinaliseRoundUseCase'

const storage = new LocalStorageAdapter()
const profileRepo = new ProfileRepository(storage)

interface MathGameStoreState {
  exercises: IMathExercise[]
  gameState: IMathGameState | null
  lastRoundResult: IRoundResult | null
  /** Tracks which exercises the player answered correctly (by exercise id). */
  answeredCorrectly: Set<string>

  startRound: (config: IMathGameConfig) => void
  submitAnswer: (exerciseId: string, answer: number) => { correct: boolean }
  loseHeart: () => void
  nextExercise: () => void
  finaliseRound: (timerBonus: boolean) => IRoundResult
  resetGame: () => void
  tick: () => void
  applyHint: (exerciseId: string) => void
  applySkip: () => void
}

export const useMathGameStore = create<MathGameStoreState>((set, get) => ({
  exercises: [],
  gameState: null,
  lastRoundResult: null,
  answeredCorrectly: new Set(),

  startRound: (config) => {
    const { exercises, gameState } = new StartMathRoundUseCase().execute(config)
    set({ exercises, gameState, lastRoundResult: null, answeredCorrectly: new Set() })
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

  finaliseRound: (timerBonus) => {
    const { gameState, exercises, answeredCorrectly } = get()
    if (!gameState) throw new Error('No active math game state')

    const correctCount = answeredCorrectly.size
    const totalBlanks = exercises.length  // 1 "blank" per exercise in math

    const result = new FinaliseRoundUseCase(profileRepo).execute({
      correctCount,
      totalBlanks,
      timerBonus,
    })

    set({ lastRoundResult: result })
    return result
  },

  resetGame: () => {
    set({ exercises: [], gameState: null, lastRoundResult: null, answeredCorrectly: new Set() })
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
    const { exercises } = get()
    const exercise = exercises.find(e => e.id === exerciseId)
    if (!exercise) return

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
}))
