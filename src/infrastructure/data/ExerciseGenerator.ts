import type { IExercise, DifficultyLevel, GameMode } from '../../domain/entities/exercise.entity'
import { blankOutTargetChars } from '../../utils/textUtils'
import { pickRandom } from '../../utils/randomUtils'

export interface IExerciseGeneratorConfig {
  mode: GameMode
  wordPool: Record<string, string[]>
  sentencePool: string[]
  exercisesPerRound: number
  difficultyLevel: DifficultyLevel
  /** Word pool for vybrane-slova mode (y_words + i_words merged). */
  vybraneSlovaPool?: string[]
  /** Per-word semantic notes for vybrane-slova mode. */
  notes?: Record<string, string>
}

export class ExerciseGenerator {
  private counter = 0
  private readonly config: IExerciseGeneratorConfig

  constructor(config: IExerciseGeneratorConfig) {
    this.config = config
  }

  generate(): IExercise[] {
    const { mode, exercisesPerRound, difficultyLevel, wordPool, sentencePool } = this.config

    if (mode === 'words') {
      return this.generateWordExercises(wordPool, difficultyLevel, exercisesPerRound)
    }
    if (mode === 'vybrane-slova') {
      return this.generateVybraneSlovaExercises(this.config.vybraneSlovaPool ?? [], exercisesPerRound)
    }
    return this.generateSentenceExercises(sentencePool, exercisesPerRound)
  }

  private generateWordExercises(
    wordPool: Record<string, string[]>,
    difficulty: DifficultyLevel,
    count: number,
  ): IExercise[] {
    const tierPool = wordPool[String(difficulty)] ?? []
    let eligible = tierPool.filter(w => /[iíyý]/.test(w))

    // Fall back to combined pool across all tiers when current tier is too small
    if (eligible.length < count) {
      const combined = (Object.values(wordPool) as string[][]).flat()
      eligible = combined.filter(w => /[iíyý]/.test(w))
    }

    const words = pickRandom(eligible, Math.min(count, eligible.length))
    return words.map(word => this.makeExercise(word, 'word', difficulty))
  }

  private generateSentenceExercises(
    sentencePool: string[],
    count: number,
  ): IExercise[] {
    const eligible = sentencePool.filter(s => /[iíyý]/.test(s))
    const sentences = pickRandom(eligible, Math.min(count, eligible.length))
    return sentences.map(s => this.makeExercise(s, 'sentence'))
  }

  private generateVybraneSlovaExercises(
    pool: string[],
    count: number,
  ): IExercise[] {
    const eligible = pool.filter(w => /[iíyý]/.test(w))
    const words = pickRandom(eligible, Math.min(count, eligible.length))
    return words.map(word =>
      this.makeExercise(word, 'word', undefined, this.config.notes?.[word])
    )
  }

  private makeExercise(
    text: string,
    type: 'word' | 'sentence',
    difficulty?: DifficultyLevel,
    note?: string,
  ): IExercise {
    const exerciseId = `ex-${++this.counter}`
    const { parts, blanks } = blankOutTargetChars(text)

    const prefixedBlanks = blanks.map((b, i) => ({
      ...b,
      id: `${exerciseId}-b${i}`,
    }))
    const prefixedParts = parts.map(p =>
      p.type === 'blank'
        ? { ...p, blankId: `${exerciseId}-b${blanks.findIndex(b => b.id === p.blankId)}` }
        : p
    )

    return {
      id: exerciseId,
      originalText: text,
      parts: prefixedParts,
      blanks: prefixedBlanks,
      type,
      ...(difficulty !== undefined ? { difficulty } : {}),
      ...(note !== undefined ? { note } : {}),
    }
  }
}
