import type { DifficultyLevel } from './exercise.entity'

/** Shape of /public/data/words_game.json */
export interface IWordsData {
  '1': string[]
  '2': string[]
  '3': string[]
  '4': string[]
}

/** Shape of /public/data/diktaty.json */
export interface ISentencesData {
  sentences: string[]
}

/** A word entry with its pre-computed difficulty */
export interface IWordEntry {
  word: string
  difficulty: DifficultyLevel
}

/** One consonant group inside /public/data/vybrane_slova.json */
export interface IVybraneSlovaGroupData {
  /** Words where y/ý is correct after the group consonant (the actual vybrané slová). */
  y_words: string[]
  /** Words where i/í is correct after the group consonant (the contrasting set). */
  i_words: string[]
  /** Semantic notes keyed by word, shown when the word has a confusable counterpart. */
  notes: Record<string, string>
}

/** Shape of /public/data/vybrane_slova.json */
export interface IVybraneSlovaData {
  b: IVybraneSlovaGroupData
  m: IVybraneSlovaGroupData
  p: IVybraneSlovaGroupData
  r: IVybraneSlovaGroupData
  s: IVybraneSlovaGroupData
  v: IVybraneSlovaGroupData
  z: IVybraneSlovaGroupData
}
