import type { IMathExercise, IMathGameConfig, IMathGameState } from '../../domain/entities/math-exercise.entity'
import { MathExerciseGenerator } from '../../infrastructure/data/MathExerciseGenerator'

export interface IStartMathRoundResult {
  exercises: IMathExercise[]
  gameState: IMathGameState
}

export class StartMathRoundUseCase {
  execute(config: IMathGameConfig): IStartMathRoundResult {
    const generator = new MathExerciseGenerator({
      category: config.category,
      exercisesPerRound: config.exercisesPerRound,
      nasobilkaMode: config.nasobilkaMode,
    })

    const exercises = generator.generate()

    const gameState: IMathGameState = {
      config,
      currentExerciseIndex: 0,
      hearts: config.maxHearts,
      xpThisRound: 0,
      totalCorrect: 0,
      totalAttempts: 0,
      timerSecondsLeft: config.timerEnabled ? config.secondsPerExercise : 0,
      hintsLeft: config.hintsPerRound,
      skipsLeft: config.skipsPerRound,
      status: 'playing',
    }

    return { exercises, gameState }
  }
}
