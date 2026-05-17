import type {
  IMathExercise,
  MathCategory,
  MathOperator,
  NasobilkaMode,
} from '../../domain/entities/math-exercise.entity'

export interface IMathExerciseGeneratorConfig {
  category: MathCategory
  exercisesPerRound: number
  nasobilkaMode?: NasobilkaMode
}

export class MathExerciseGenerator {
  private counter = 0
  private readonly config: IMathExerciseGeneratorConfig

  constructor(config: IMathExerciseGeneratorConfig) {
    this.config = config
  }

  generate(): IMathExercise[] {
    const { category, exercisesPerRound } = this.config
    const exercises: IMathExercise[] = []

    for (let i = 0; i < exercisesPerRound; i++) {
      exercises.push(this.makeExercise(category))
    }

    return exercises
  }

  private makeExercise(category: MathCategory): IMathExercise {
    switch (category) {
      case 'add-sub-10':
        return this.makeAddSub(10)
      case 'add-sub-20':
        return this.makeAddSub(20)
      case 'add-sub-100':
        return this.makeAddSub(100)
      case 'add-sub-1000':
        return this.makeAddSub(1000)
      case 'nasobilka':
        return this.makeNasobilka()
    }
  }

  private makeAddSub(max: number): IMathExercise {
    const isAddition = Math.random() < 0.5
    let a: number, b: number, answer: number
    const operator: MathOperator = isAddition ? '+' : '-'

    if (isAddition) {
      // a + b <= max
      a = randInt(0, max)
      b = randInt(0, max - a)
      answer = a + b
    } else {
      // a - b >= 0
      a = randInt(0, max)
      b = randInt(0, a)
      answer = a - b
    }

    return this.buildExercise(a, b, operator, answer)
  }

  private makeNasobilka(): IMathExercise {
    const mode = this.config.nasobilkaMode ?? 'both'
    let isMultiply: boolean

    if (mode === 'multiply') isMultiply = true
    else if (mode === 'divide') isMultiply = false
    else isMultiply = Math.random() < 0.5

    if (isMultiply) {
      const a = randInt(1, 10)
      const b = randInt(1, 10)
      return this.buildExercise(a, b, '×', a * b)
    } else {
      // Division: pick factors, build dividend
      const divisor = randInt(1, 10)
      const quotient = randInt(1, 10)
      const dividend = divisor * quotient
      return this.buildExercise(dividend, divisor, ':', quotient)
    }
  }

  private buildExercise(
    operand1: number,
    operand2: number,
    operator: MathOperator,
    correctAnswer: number,
  ): IMathExercise {
    const id = `math-${++this.counter}`
    const options = this.generateOptions(correctAnswer, operator)
    const displayText = `${operand1} ${operator} ${operand2} = ?`

    return { id, operand1, operand2, operator, correctAnswer, options, displayText }
  }

  private generateOptions(correct: number, operator: MathOperator): number[] {
    const distractors = new Set<number>()

    // Determine range for distractors based on context
    const spread = Math.max(3, Math.ceil(correct * 0.3))

    let attempts = 0
    while (distractors.size < 3 && attempts < 100) {
      attempts++
      let d: number

      if (operator === '×' || operator === ':') {
        // For multiplication/division, pick from plausible table values
        d = correct + randInt(-spread, spread)
      } else {
        d = correct + randInt(-spread, spread)
      }

      // Ensure non-negative, not equal to correct, and integer
      if (d >= 0 && d !== correct && Number.isInteger(d)) {
        distractors.add(d)
      }
    }

    // Fallback: if we couldn't generate enough distractors, fill with sequential values
    let fallback = correct + 1
    while (distractors.size < 3) {
      if (fallback !== correct && fallback >= 0) {
        distractors.add(fallback)
      }
      fallback++
    }

    const options = [correct, ...distractors]
    // Shuffle
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]]
    }

    return options
  }
}

/** Random integer in [min, max] inclusive. */
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
