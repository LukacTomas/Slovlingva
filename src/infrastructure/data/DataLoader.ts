import type { DifficultyLevel, VybraneSlovaGroup } from '../../domain/entities/exercise.entity'
import type { IWordsData, ISentencesData, IVybraneSlovaData } from '../../domain/entities/data.entity'
import type { IExerciseSource, IVybraneSlovaResult } from '../../domain/ports/IExerciseSource'

const SINGLE_GROUPS = ['b', 'm', 'p', 'r', 's', 'v', 'z'] as const
type SingleGroup = typeof SINGLE_GROUPS[number]

export class DataLoader implements IExerciseSource {
  private words: IWordsData | null = null
  private sentences: ISentencesData | null = null
  private vybrane: IVybraneSlovaData | null = null

  async load(): Promise<void> {
    const [wordsRes, sentencesRes, vybraneRes] = await Promise.all([
      fetch('/data/words_game.json'),
      fetch('/data/diktaty.json'),
      fetch('/data/vybrane_slova.json'),
    ])

    if (!wordsRes.ok) throw new Error(`Failed to load words: ${wordsRes.status}`)
    if (!sentencesRes.ok) throw new Error(`Failed to load sentences: ${sentencesRes.status}`)
    if (!vybraneRes.ok) throw new Error(`Failed to load vybrane slova: ${vybraneRes.status}`)

    this.words = await wordsRes.json() as IWordsData
    this.sentences = await sentencesRes.json() as ISentencesData
    this.vybrane = await vybraneRes.json() as IVybraneSlovaData
  }

  getWords(difficulty: DifficultyLevel): string[] {
    if (!this.words) throw new Error('DataLoader not loaded — call load() first')
    return this.words[String(difficulty) as keyof IWordsData]
  }

  getSentences(): string[] {
    if (!this.sentences) throw new Error('DataLoader not loaded — call load() first')
    return this.sentences.sentences
  }

  getVybraneSlovaWords(group: VybraneSlovaGroup): IVybraneSlovaResult {
    if (!this.vybrane) throw new Error('DataLoader not loaded — call load() first')

    if (group === 'mix') {
      const words: string[] = []
      const notes: Record<string, string> = {}
      for (const g of SINGLE_GROUPS) {
        const groupData = this.vybrane[g as SingleGroup]
        words.push(...groupData.y_words, ...groupData.i_words)
        Object.assign(notes, groupData.notes)
      }
      return { words, notes }
    }

    const groupData = this.vybrane[group as SingleGroup]
    const words = [...groupData.y_words, ...groupData.i_words]
    return { words, notes: { ...groupData.notes } }
  }
}
