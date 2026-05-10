import { describe, it, expect } from 'vitest'
import { SubmitAnswerUseCase } from './SubmitAnswerUseCase'
import type { IExercise } from '../../domain/entities/exercise.entity'

const exercise: IExercise = {
  id: 'ex-1',
  originalText: 'ryba',
  type: 'word',
  difficulty: 1,
  parts: [
    { type: 'blank', blankId: 'ex-1-b0' },
    { type: 'text', content: 'ba' },
  ],
  blanks: [
    { id: 'ex-1-b0', charIndex: 0, correctChar: 'y', filledChar: null, state: 'empty' },
  ],
}

describe('SubmitAnswerUseCase', () => {
  const useCase = new SubmitAnswerUseCase()

  it('returns correct: true when the char matches', () => {
    const { correct } = useCase.execute({ exercise, blankId: 'ex-1-b0', char: 'y' })
    expect(correct).toBe(true)
  })

  it('returns correct: false when the char does not match', () => {
    const { correct } = useCase.execute({ exercise, blankId: 'ex-1-b0', char: 'i' })
    expect(correct).toBe(false)
  })

  it('sets blank state to correct on right answer', () => {
    const { updatedExercise } = useCase.execute({ exercise, blankId: 'ex-1-b0', char: 'y' })
    expect(updatedExercise.blanks[0].state).toBe('correct')
  })

  it('sets blank state to wrong on wrong answer', () => {
    const { updatedExercise } = useCase.execute({ exercise, blankId: 'ex-1-b0', char: 'i' })
    expect(updatedExercise.blanks[0].state).toBe('wrong')
  })

  it('sets filledChar on the blank', () => {
    const { updatedExercise } = useCase.execute({ exercise, blankId: 'ex-1-b0', char: 'ý' })
    expect(updatedExercise.blanks[0].filledChar).toBe('ý')
  })

  it('does not mutate the original exercise', () => {
    useCase.execute({ exercise, blankId: 'ex-1-b0', char: 'y' })
    expect(exercise.blanks[0].state).toBe('empty')
  })

  it('reports allBlanksResolved when every blank is filled', () => {
    const { allBlanksResolved } = useCase.execute({ exercise, blankId: 'ex-1-b0', char: 'y' })
    expect(allBlanksResolved).toBe(true)
  })

  it('throws when blankId is not found', () => {
    expect(() => useCase.execute({ exercise, blankId: 'ghost', char: 'y' })).toThrow()
  })
})
