import { describe, it, expect } from 'vitest'
import { StartMathRoundUseCase } from './StartMathRoundUseCase'
import type { IMathGameConfig } from '../../domain/entities/math-exercise.entity'

const baseConfig: IMathGameConfig = {
  category: 'add-sub-10',
  answerMode: 'choice',
  exercisesPerRound: 6,
  maxHearts: 3,
  timerEnabled: false,
  secondsPerExercise: 20,
  hintsPerRound: 0,
  skipsPerRound: 0,
}

describe('StartMathRoundUseCase', () => {
  it('returns the configured number of exercises', () => {
    const { exercises } = new StartMathRoundUseCase().execute(baseConfig)
    expect(exercises).toHaveLength(6)
  })

  it('returns gameState with status playing', () => {
    const { gameState } = new StartMathRoundUseCase().execute(baseConfig)
    expect(gameState.status).toBe('playing')
  })

  it('initialises hearts from config', () => {
    const config = { ...baseConfig, maxHearts: 5 }
    const { gameState } = new StartMathRoundUseCase().execute(config)
    expect(gameState.hearts).toBe(5)
  })

  it('sets currentExerciseIndex to 0', () => {
    const { gameState } = new StartMathRoundUseCase().execute(baseConfig)
    expect(gameState.currentExerciseIndex).toBe(0)
  })

  it('sets timerSecondsLeft to 0 when timer disabled', () => {
    const { gameState } = new StartMathRoundUseCase().execute(baseConfig)
    expect(gameState.timerSecondsLeft).toBe(0)
  })

  it('sets timerSecondsLeft from config when timer enabled', () => {
    const config = { ...baseConfig, timerEnabled: true, secondsPerExercise: 15 }
    const { gameState } = new StartMathRoundUseCase().execute(config)
    expect(gameState.timerSecondsLeft).toBe(15)
  })

  it('initialises hintsLeft from config', () => {
    const config = { ...baseConfig, hintsPerRound: 2 }
    const { gameState } = new StartMathRoundUseCase().execute(config)
    expect(gameState.hintsLeft).toBe(2)
  })

  it('initialises skipsLeft from config', () => {
    const config = { ...baseConfig, skipsPerRound: 1 }
    const { gameState } = new StartMathRoundUseCase().execute(config)
    expect(gameState.skipsLeft).toBe(1)
  })

  it('stores the config on gameState', () => {
    const { gameState } = new StartMathRoundUseCase().execute(baseConfig)
    expect(gameState.config).toEqual(baseConfig)
  })

  it('passes nasobilkaMode to the generator for nasobilka category', () => {
    const config: IMathGameConfig = { ...baseConfig, category: 'nasobilka', nasobilkaMode: 'multiply' }
    const { exercises } = new StartMathRoundUseCase().execute(config)
    exercises.forEach(e => {
      expect(e.operator).toBe('×')
    })
  })

  it('passes nasobilkaMode divide to the generator', () => {
    const config: IMathGameConfig = { ...baseConfig, category: 'nasobilka', nasobilkaMode: 'divide' }
    const { exercises } = new StartMathRoundUseCase().execute(config)
    exercises.forEach(e => {
      expect(e.operator).toBe(':')
    })
  })

  it('each exercise has a unique id', () => {
    const { exercises } = new StartMathRoundUseCase().execute(baseConfig)
    const ids = exercises.map(e => e.id)
    expect(new Set(ids).size).toBe(6)
  })

  it('initialises xpThisRound to 0', () => {
    const { gameState } = new StartMathRoundUseCase().execute(baseConfig)
    expect(gameState.xpThisRound).toBe(0)
  })

  it('initialises totalCorrect and totalAttempts to 0', () => {
    const { gameState } = new StartMathRoundUseCase().execute(baseConfig)
    expect(gameState.totalCorrect).toBe(0)
    expect(gameState.totalAttempts).toBe(0)
  })
})
