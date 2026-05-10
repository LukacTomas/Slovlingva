import type { DifficultyLevel, VybraneSlovaGroup } from '../entities/exercise.entity'

export interface IVybraneSlovaResult {
  words: string[]
  notes: Record<string, string>
}

export interface IExerciseSource {
  load(): Promise<void>
  getWords(difficulty: DifficultyLevel): string[]
  getSentences(): string[]
  getVybraneSlovaWords(group: VybraneSlovaGroup): IVybraneSlovaResult
}
