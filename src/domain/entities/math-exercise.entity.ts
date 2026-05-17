import type { GameStatus } from './game.entity'

export type MathOperator = '+' | '-' | '×' | ':'

export type MathCategory =
  | 'add-sub-10'
  | 'add-sub-20'
  | 'add-sub-100'
  | 'add-sub-1000'
  | 'nasobilka'

export type NasobilkaMode = 'multiply' | 'divide' | 'both'

export type MathAnswerMode = 'choice' | 'input'

export interface IMathExercise {
  id: string
  operand1: number
  operand2: number
  operator: MathOperator
  correctAnswer: number
  /** 4 answer options for choice mode (includes the correct answer, shuffled). */
  options: number[]
  /** Human-readable form, e.g. "5 × 8 = ?" */
  displayText: string
}

export interface IMathGameConfig {
  category: MathCategory
  /** Only used when category === 'nasobilka'. */
  nasobilkaMode?: NasobilkaMode
  answerMode: MathAnswerMode
  exercisesPerRound: number
  maxHearts: number
  timerEnabled: boolean
  secondsPerExercise: number
  hintsPerRound: number
  skipsPerRound: number
}

export interface IMathGameState {
  config: IMathGameConfig
  currentExerciseIndex: number
  hearts: number
  xpThisRound: number
  totalCorrect: number
  totalAttempts: number
  timerSecondsLeft: number
  hintsLeft: number
  skipsLeft: number
  status: GameStatus
}
