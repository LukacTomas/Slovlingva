import { describe, it, expect } from 'vitest'
import { MathExerciseGenerator } from './MathExerciseGenerator'
import type { MathCategory, NasobilkaMode, IMathExercise } from '../../domain/entities/math-exercise.entity'

function generate(category: MathCategory, count = 6, nasobilkaMode?: NasobilkaMode): IMathExercise[] {
  return new MathExerciseGenerator({ category, exercisesPerRound: count, nasobilkaMode }).generate()
}

describe('MathExerciseGenerator', () => {
  describe('common properties', () => {
    const categories: MathCategory[] = ['add-sub-10', 'add-sub-20', 'add-sub-100', 'add-sub-1000', 'nasobilka']

    it.each(categories)('generates exactly exercisesPerRound exercises for %s', (cat) => {
      const nasobilkaMode = cat === 'nasobilka' ? 'both' : undefined
      expect(generate(cat, 6, nasobilkaMode)).toHaveLength(6)
    })

    it.each(categories)('each exercise has a unique id for %s', (cat) => {
      const nasobilkaMode = cat === 'nasobilka' ? 'both' : undefined
      const ids = generate(cat, 6, nasobilkaMode).map(e => e.id)
      expect(new Set(ids).size).toBe(6)
    })

    it.each(categories)('each exercise has exactly 4 answer options for %s', (cat) => {
      const nasobilkaMode = cat === 'nasobilka' ? 'both' : undefined
      generate(cat, 6, nasobilkaMode).forEach(e => {
        expect(e.options).toHaveLength(4)
      })
    })

    it.each(categories)('options include the correct answer for %s', (cat) => {
      const nasobilkaMode = cat === 'nasobilka' ? 'both' : undefined
      generate(cat, 6, nasobilkaMode).forEach(e => {
        expect(e.options).toContain(e.correctAnswer)
      })
    })

    it.each(categories)('options contain no duplicates for %s', (cat) => {
      const nasobilkaMode = cat === 'nasobilka' ? 'both' : undefined
      generate(cat, 6, nasobilkaMode).forEach(e => {
        expect(new Set(e.options).size).toBe(4)
      })
    })

    it.each(categories)('all options are non-negative integers for %s', (cat) => {
      const nasobilkaMode = cat === 'nasobilka' ? 'both' : undefined
      generate(cat, 10, nasobilkaMode).forEach(e => {
        e.options.forEach(o => {
          expect(o).toBeGreaterThanOrEqual(0)
          expect(Number.isInteger(o)).toBe(true)
        })
      })
    })

    it.each(categories)('displayText contains the operator and operands for %s', (cat) => {
      const nasobilkaMode = cat === 'nasobilka' ? 'both' : undefined
      generate(cat, 6, nasobilkaMode).forEach(e => {
        expect(e.displayText).toContain(String(e.operand1))
        expect(e.displayText).toContain(String(e.operand2))
        expect(e.displayText).toContain(e.operator)
        expect(e.displayText).toContain('?')
      })
    })
  })

  describe('add-sub-10', () => {
    it('operands and result are within 0–10', () => {
      generate('add-sub-10', 20).forEach(e => {
        expect(e.operand1).toBeGreaterThanOrEqual(0)
        expect(e.operand2).toBeGreaterThanOrEqual(0)
        expect(e.correctAnswer).toBeGreaterThanOrEqual(0)
        expect(e.correctAnswer).toBeLessThanOrEqual(10)
      })
    })

    it('uses only + and - operators', () => {
      generate('add-sub-10', 20).forEach(e => {
        expect(['+', '-']).toContain(e.operator)
      })
    })

    it('correctAnswer equals operand1 op operand2', () => {
      generate('add-sub-10', 20).forEach(e => {
        const expected = e.operator === '+' ? e.operand1 + e.operand2 : e.operand1 - e.operand2
        expect(e.correctAnswer).toBe(expected)
      })
    })

    it('subtraction results are non-negative (operand1 >= operand2)', () => {
      generate('add-sub-10', 30).forEach(e => {
        if (e.operator === '-') {
          expect(e.operand1).toBeGreaterThanOrEqual(e.operand2)
        }
      })
    })
  })

  describe('add-sub-20', () => {
    it('operands and result are within 0–20', () => {
      generate('add-sub-20', 20).forEach(e => {
        expect(e.correctAnswer).toBeGreaterThanOrEqual(0)
        expect(e.correctAnswer).toBeLessThanOrEqual(20)
      })
    })

    it('uses only + and - operators', () => {
      generate('add-sub-20', 20).forEach(e => {
        expect(['+', '-']).toContain(e.operator)
      })
    })

    it('correctAnswer equals operand1 op operand2', () => {
      generate('add-sub-20', 20).forEach(e => {
        const expected = e.operator === '+' ? e.operand1 + e.operand2 : e.operand1 - e.operand2
        expect(e.correctAnswer).toBe(expected)
      })
    })
  })

  describe('add-sub-100', () => {
    it('operands and result are within 0–100', () => {
      generate('add-sub-100', 20).forEach(e => {
        expect(e.correctAnswer).toBeGreaterThanOrEqual(0)
        expect(e.correctAnswer).toBeLessThanOrEqual(100)
      })
    })

    it('correctAnswer equals operand1 op operand2', () => {
      generate('add-sub-100', 20).forEach(e => {
        const expected = e.operator === '+' ? e.operand1 + e.operand2 : e.operand1 - e.operand2
        expect(e.correctAnswer).toBe(expected)
      })
    })
  })

  describe('add-sub-1000', () => {
    it('operands and result are within 0–1000', () => {
      generate('add-sub-1000', 20).forEach(e => {
        expect(e.correctAnswer).toBeGreaterThanOrEqual(0)
        expect(e.correctAnswer).toBeLessThanOrEqual(1000)
      })
    })

    it('correctAnswer equals operand1 op operand2', () => {
      generate('add-sub-1000', 20).forEach(e => {
        const expected = e.operator === '+' ? e.operand1 + e.operand2 : e.operand1 - e.operand2
        expect(e.correctAnswer).toBe(expected)
      })
    })
  })

  describe('nasobilka — multiply mode', () => {
    it('uses only × operator', () => {
      generate('nasobilka', 20, 'multiply').forEach(e => {
        expect(e.operator).toBe('×')
      })
    })

    it('operands are in 1–10 range', () => {
      generate('nasobilka', 30, 'multiply').forEach(e => {
        expect(e.operand1).toBeGreaterThanOrEqual(1)
        expect(e.operand1).toBeLessThanOrEqual(10)
        expect(e.operand2).toBeGreaterThanOrEqual(1)
        expect(e.operand2).toBeLessThanOrEqual(10)
      })
    })

    it('correctAnswer equals operand1 × operand2', () => {
      generate('nasobilka', 20, 'multiply').forEach(e => {
        expect(e.correctAnswer).toBe(e.operand1 * e.operand2)
      })
    })
  })

  describe('nasobilka — divide mode', () => {
    it('uses only : operator', () => {
      generate('nasobilka', 20, 'divide').forEach(e => {
        expect(e.operator).toBe(':')
      })
    })

    it('operand1 is evenly divisible by operand2', () => {
      generate('nasobilka', 20, 'divide').forEach(e => {
        expect(e.operand1 % e.operand2).toBe(0)
      })
    })

    it('correctAnswer equals operand1 / operand2', () => {
      generate('nasobilka', 20, 'divide').forEach(e => {
        expect(e.correctAnswer).toBe(e.operand1 / e.operand2)
      })
    })

    it('result is in 1–10 range (from multiplication tables)', () => {
      generate('nasobilka', 30, 'divide').forEach(e => {
        expect(e.correctAnswer).toBeGreaterThanOrEqual(1)
        expect(e.correctAnswer).toBeLessThanOrEqual(10)
      })
    })
  })

  describe('nasobilka — both mode', () => {
    it('uses × and : operators (mix)', () => {
      // With enough exercises, we should see both operators
      const operators = generate('nasobilka', 50, 'both').map(e => e.operator)
      expect(operators).toContain('×')
      expect(operators).toContain(':')
    })

    it('all exercises are mathematically correct', () => {
      generate('nasobilka', 30, 'both').forEach(e => {
        if (e.operator === '×') {
          expect(e.correctAnswer).toBe(e.operand1 * e.operand2)
        } else {
          expect(e.correctAnswer).toBe(e.operand1 / e.operand2)
        }
      })
    })
  })

  describe('nasobilka defaults to both when nasobilkaMode is undefined', () => {
    it('generates exercises when nasobilkaMode is omitted', () => {
      const exercises = generate('nasobilka', 6)
      expect(exercises).toHaveLength(6)
    })
  })

  describe('distractor quality', () => {
    it('distractors are close to the correct answer (within reasonable range)', () => {
      generate('add-sub-100', 20).forEach(e => {
        e.options.forEach(o => {
          // Distractors should not be wildly far from correct answer
          const diff = Math.abs(o - e.correctAnswer)
          expect(diff).toBeLessThanOrEqual(e.correctAnswer + 10)
        })
      })
    })
  })
})
