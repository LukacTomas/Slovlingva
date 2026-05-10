import type { GameMode, DifficultyLevel, VybraneSlovaGroup } from './exercise.entity'

export type GameStatus = 'idle' | 'playing' | 'round_end' | 'game_over'

export interface IGameConfig {
  mode: GameMode
  exercisesPerRound: number   // always 6
  maxHearts: number           // 3 + profile.skills.heartSlots
  timerEnabled: boolean
  secondsPerExercise: number  // used only when timerEnabled
  difficultyLevel: DifficultyLevel
  hintsPerRound: number       // from profile.skills.hintsPerRound
  skipsPerRound: number       // from profile.skills.skipCharges
  /** Only used when mode === 'vybrane-slova'. */
  vybraneSlovaGroup?: VybraneSlovaGroup
}

export interface IGameState {
  config: IGameConfig
  currentExerciseIndex: number
  hearts: number
  xpThisRound: number
  totalCorrect: number
  totalAttempts: number
  timerSecondsLeft: number
  hintsLeft: number           // decremented each time a hint is used
  skipsLeft: number           // decremented each time an exercise is skipped
  status: GameStatus
}

export interface IRoundResult {
  xpEarned: number
  accuracy: number            // 0–1
  correctCount: number
  totalBlanks: number
  leveledUp: boolean
  newLevel: number
  skillPointsEarned: number   // 1 per level gained this round, else 0
  streak: number              // current streak after this round
  streakIncreased: boolean    // true only when streak was incremented (consecutive day)
}
