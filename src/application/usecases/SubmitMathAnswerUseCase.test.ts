import { describe, it, expect } from 'vitest'
import { SubmitMathAnswerUseCase } from './SubmitMathAnswerUseCase'
import type { IMathExercise } from '../../domain/entities/math-exercise.entity'

const exercise: IMathExercise = {
  id: 'math-1',
  operand1: 5,
  operand2: 3,
  operator: '+',
  correctAnswer: 8,
  options: [6, 8, 9, 7],
  displayText: '5 + 3 = ?',
}

describe('SubmitMathAnswerUseCase', () => {
  const useCase = new SubmitMathAnswerUseCase()

  it('returns correct: true when answer matches', () => {
    const result = useCase.execute({ exercise, answer: 8 })
    expect(result.correct).toBe(true)
  })

  it('returns correct: false when answer does not match', () => {
    const result = useCase.execute({ exercise, answer: 7 })
    expect(result.correct).toBe(false)
  })

  it('returns the exerciseId', () => {
    const result = useCase.execute({ exercise, answer: 8 })
    expect(result.exerciseId).toBe('math-1')
  })

  it('works for multiplication exercises', () => {
    const mulExercise: IMathExercise = {
      id: 'math-2',
      operand1: 6,
      operand2: 7,
      operator: '×',
      correctAnswer: 42,
      options: [36, 42, 48, 35],
      displayText: '6 × 7 = ?',
    }
    expect(useCase.execute({ exercise: mulExercise, answer: 42 }).correct).toBe(true)
    expect(useCase.execute({ exercise: mulExercise, answer: 36 }).correct).toBe(false)
  })

  it('works for division exercises', () => {
    const divExercise: IMathExercise = {
      id: 'math-3',
      operand1: 40,
      operand2: 8,
      operator: ':',
      correctAnswer: 5,
      options: [4, 5, 6, 8],
      displayText: '40 : 8 = ?',
    }
    expect(useCase.execute({ exercise: divExercise, answer: 5 }).correct).toBe(true)
    expect(useCase.execute({ exercise: divExercise, answer: 8 }).correct).toBe(false)
  })

  it('does not mutate the original exercise', () => {
    useCase.execute({ exercise, answer: 8 })
    expect(exercise.correctAnswer).toBe(8)
    expect(exercise.id).toBe('math-1')
  })
})
