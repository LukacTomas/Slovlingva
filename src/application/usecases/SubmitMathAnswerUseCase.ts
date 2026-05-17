import type { IMathExercise } from '../../domain/entities/math-exercise.entity'

export interface ISubmitMathAnswerInput {
  exercise: IMathExercise
  answer: number
}

export interface ISubmitMathAnswerResult {
  correct: boolean
  exerciseId: string
}

export class SubmitMathAnswerUseCase {
  execute({ exercise, answer }: ISubmitMathAnswerInput): ISubmitMathAnswerResult {
    const correct = answer === exercise.correctAnswer
    return { correct, exerciseId: exercise.id }
  }
}
