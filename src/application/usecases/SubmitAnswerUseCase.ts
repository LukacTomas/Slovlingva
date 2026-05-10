import type { IExercise, CharacterOption } from '../../domain/entities/exercise.entity'

export interface ISubmitAnswerInput {
  exercise: IExercise
  blankId: string
  char: CharacterOption
}

export interface ISubmitAnswerResult {
  correct: boolean
  updatedExercise: IExercise
  allBlanksResolved: boolean
}

export class SubmitAnswerUseCase {
  execute({ exercise, blankId, char }: ISubmitAnswerInput): ISubmitAnswerResult {
    const blank = exercise.blanks.find(b => b.id === blankId)
    if (!blank) throw new Error(`Blank not found: ${blankId}`)

    const correct = blank.correctChar === char

    const updatedBlanks = exercise.blanks.map(b =>
      b.id === blankId
        ? { ...b, filledChar: char, state: correct ? 'correct' as const : 'wrong' as const }
        : b
    )

    const updatedExercise: IExercise = { ...exercise, blanks: updatedBlanks }
    const allBlanksResolved = updatedBlanks.every(b => b.state === 'correct' || b.state === 'wrong')

    return { correct, updatedExercise, allBlanksResolved }
  }
}
