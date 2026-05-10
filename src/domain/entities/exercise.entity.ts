export type CharacterOption = 'i' | 'í' | 'y' | 'ý'

export type ExerciseType = 'word' | 'sentence'

export type GameMode = 'words' | 'sentences' | 'vybrane-slova'

/** Consonant group for Vybrané slová mode. 'mix' combines all groups. */
export type VybraneSlovaGroup = 'b' | 'm' | 'p' | 'r' | 's' | 'v' | 'z' | 'mix'

export type BlankState = 'empty' | 'filled' | 'correct' | 'wrong'

export type DifficultyLevel = 1 | 2 | 3 | 4

export interface IBlank {
  id: string
  charIndex: number       // position in originalText
  correctChar: CharacterOption
  filledChar: CharacterOption | null
  state: BlankState
}

export interface ITextPart {
  type: 'text' | 'blank'
  content?: string        // for type === 'text'
  blankId?: string        // for type === 'blank'
}

export interface IExercise {
  id: string
  originalText: string
  parts: ITextPart[]
  blanks: IBlank[]
  type: ExerciseType
  difficulty?: DifficultyLevel  // only set in word mode
  /** Semantic note shown to the player when this word has a confusable counterpart. */
  note?: string
}
