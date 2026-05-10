import type { IExercise, DifficultyLevel } from '../../domain/entities/exercise.entity'
import type { IGameConfig, IGameState } from '../../domain/entities/game.entity'
import type { IExerciseSource } from '../../domain/ports/IExerciseSource'
import { ExerciseGenerator } from '../../infrastructure/data/ExerciseGenerator'

export interface IStartRoundResult {
  exercises: IExercise[]
  gameState: IGameState
}

export class StartRoundUseCase {
  private readonly exerciseSource: IExerciseSource

  constructor(exerciseSource: IExerciseSource) {
    this.exerciseSource = exerciseSource
  }

  execute(config: IGameConfig): IStartRoundResult {
    const wordPool = this.buildWordPool(config.difficultyLevel)
    const sentencePool = this.exerciseSource.getSentences()

    let vybraneSlovaPool: string[] | undefined
    let notes: Record<string, string> | undefined

    if (config.mode === 'vybrane-slova' && config.vybraneSlovaGroup) {
      const result = this.exerciseSource.getVybraneSlovaWords(config.vybraneSlovaGroup)
      vybraneSlovaPool = result.words
      notes = result.notes
    }

    const generator = new ExerciseGenerator({
      mode: config.mode,
      wordPool,
      sentencePool,
      exercisesPerRound: config.exercisesPerRound,
      difficultyLevel: config.difficultyLevel,
      vybraneSlovaPool,
      notes,
    })

    const exercises = generator.generate()

    const gameState: IGameState = {
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

  private buildWordPool(_difficulty: DifficultyLevel): Record<string, string[]> {
    const pool: Record<string, string[]> = {}
    const levels: DifficultyLevel[] = [1, 2, 3, 4]
    for (const lvl of levels) {
      pool[String(lvl)] = this.exerciseSource.getWords(lvl)
    }
    // For modes that want a specific difficulty, only that key matters;
    // ExerciseGenerator falls back to combined pool automatically.
    return pool
  }
}
