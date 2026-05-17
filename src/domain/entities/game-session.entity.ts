import type { AppPage } from '../../App'
import type { IRoundResult, GameStatus } from './game.entity'

/** Reason an exercise was marked as failed during a round. */
export type FailReason = 'wrong' | 'skipped' | 'timeout' | 'hint'

/** A record of one failed exercise, subject-agnostic. */
export interface IFailedExerciseRecord {
  exerciseIndex: number
  reason: FailReason
}

/** Subject identifier — extensible for future subjects. */
export type SubjectId = 'slovencina' | 'matematika'

/** Route info so shared pages know where to navigate per subject. */
export interface ISubjectRoutes {
  setupPage: AppPage
  gamePage: AppPage
}

/** Data written by a subject store when a round ends, read by shared pages. */
export interface ISessionSnapshot {
  subject: SubjectId
  routes: ISubjectRoutes
  lastRoundResult: IRoundResult
  gameStatus: GameStatus
  failedExercises: IFailedExerciseRecord[]
  /** The original exercise objects for replay. Typed as unknown[] to stay subject-agnostic. */
  replayExercises: unknown[]
  /** Registry key for the component that can render these exercises in replay mode. */
  rendererKey: string
  /** The game config, so "play again" can restart with the same settings. */
  gameConfig: unknown
  /** Callback to start a new round with the same config. Called by RoundEndPage "play again". */
  restartRound: () => void
  /** Callback to reset the game state. Called by RoundEndPage "change settings". */
  resetGame: () => void
}
