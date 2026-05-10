import { describe, it, expect } from 'vitest'
import { ExerciseGenerator } from './ExerciseGenerator'
import type { DifficultyLevel } from '../../domain/entities/exercise.entity'

const wordPool: Record<string, string[]> = {
  '1': ['myš', 'ryba', 'sýty', 'víla'],
  '2': ['bicykel', 'divina', 'výzva', 'tíšina'],
  '3': ['bylina', 'básnik', 'výklad', 'písmeno'],
  '4': ['histórika', 'výsledok', 'fyzicky', 'myslivec'],
}

const sentencePool = [
  'Ryba pláva v rieke.',
  'Víla tancuje v lese.',
  'Sýty vlk líže si pysky.',
  'Básnik píše básne.',
  'Bicykel stojí pri plote.',
  'Výzva je pred nami.',
  'Tíšina vládne v noci.',
  'Bylina rastie na lúke.',
]

const vybraneSlovaPool = [
  'byť', 'bylina', 'nábytok',
  'biely', 'bicykel', 'biológia', 'bitka',
  'myš', 'myslieť',
  'milý', 'miesto',
]

function makeGenerator(mode: 'words' | 'sentences') {
  return new ExerciseGenerator({
    mode,
    wordPool,
    sentencePool,
    exercisesPerRound: 6,
    difficultyLevel: 2 as DifficultyLevel,
  })
}

function makeVybraneGenerator(pool = vybraneSlovaPool, notes: Record<string, string> = {}) {
  return new ExerciseGenerator({
    mode: 'vybrane-slova',
    wordPool,
    sentencePool,
    exercisesPerRound: 6,
    difficultyLevel: 1 as DifficultyLevel,
    vybraneSlovaPool: pool,
    notes,
  })
}

describe('ExerciseGenerator', () => {
  describe('generate', () => {
    it('returns exactly exercisesPerRound exercises in word mode', () => {
      expect(makeGenerator('words').generate()).toHaveLength(6)
    })

    it('returns exactly exercisesPerRound exercises in sentence mode', () => {
      expect(makeGenerator('sentences').generate()).toHaveLength(6)
    })

    it('each exercise has a unique id', () => {
      const ids = makeGenerator('words').generate().map(e => e.id)
      expect(new Set(ids).size).toBe(6)
    })

    it('word exercises have type "word"', () => {
      makeGenerator('words').generate().forEach(e => expect(e.type).toBe('word'))
    })

    it('sentence exercises have type "sentence"', () => {
      makeGenerator('sentences').generate().forEach(e => expect(e.type).toBe('sentence'))
    })

    it('every exercise has at least one blank', () => {
      makeGenerator('words').generate().forEach(e => expect(e.blanks.length).toBeGreaterThan(0))
    })

    it('blank ids are unique across all exercises in a round', () => {
      const exercises = makeGenerator('words').generate()
      const allIds = exercises.flatMap(e => e.blanks.map(b => b.id))
      expect(new Set(allIds).size).toBe(allIds.length)
    })

    it('each blank correctChar is one of i/í/y/ý', () => {
      const valid = new Set(['i', 'í', 'y', 'ý'])
      makeGenerator('words').generate().forEach(e =>
        e.blanks.forEach(b => expect(valid.has(b.correctChar)).toBe(true))
      )
    })

    it('parts + blanks reconstruct the original text', () => {
      makeGenerator('words').generate().forEach(e => {
        const reconstructed = e.parts.map(p =>
          p.type === 'text' ? p.content! : e.blanks.find(b => b.id === p.blankId)!.correctChar
        ).join('')
        expect(reconstructed).toBe(e.originalText)
      })
    })

    it('word exercises include difficulty field', () => {
      makeGenerator('words').generate().forEach(e => expect(e.difficulty).toBeDefined())
    })
  })

  describe('vybrane-slova mode', () => {
    it('generates exercises of type "word"', () => {
      makeVybraneGenerator().generate().forEach(e => expect(e.type).toBe('word'))
    })

    it('returns up to exercisesPerRound exercises', () => {
      const result = makeVybraneGenerator().generate()
      expect(result.length).toBeLessThanOrEqual(6)
      expect(result.length).toBeGreaterThan(0)
    })

    it('each exercise has at least one blank', () => {
      makeVybraneGenerator().generate().forEach(e =>
        expect(e.blanks.length).toBeGreaterThan(0)
      )
    })

    it('parts + blanks reconstruct the original text', () => {
      makeVybraneGenerator().generate().forEach(e => {
        const reconstructed = e.parts.map(p =>
          p.type === 'text' ? p.content! : e.blanks.find(b => b.id === p.blankId)!.correctChar
        ).join('')
        expect(reconstructed).toBe(e.originalText)
      })
    })

    it('does not set difficulty field', () => {
      makeVybraneGenerator().generate().forEach(e => expect(e.difficulty).toBeUndefined())
    })

    it('attaches note to exercise when word appears in notes map', () => {
      const notes = { byť: 'existovať, nachádzať sa' }
      const gen = new ExerciseGenerator({
        mode: 'vybrane-slova',
        wordPool,
        sentencePool,
        exercisesPerRound: 6,
        difficultyLevel: 1 as DifficultyLevel,
        vybraneSlovaPool: ['byť'],
        notes,
      })
      const exercises = gen.generate()
      expect(exercises).toHaveLength(1)
      expect(exercises[0].note).toBe('existovať, nachádzať sa')
    })

    it('leaves note undefined for words not in notes map', () => {
      const gen = new ExerciseGenerator({
        mode: 'vybrane-slova',
        wordPool,
        sentencePool,
        exercisesPerRound: 6,
        difficultyLevel: 1 as DifficultyLevel,
        vybraneSlovaPool: ['bylina'],
        notes: {},
      })
      const exercises = gen.generate()
      expect(exercises[0].note).toBeUndefined()
    })

    it('blank ids are unique across all exercises', () => {
      const exercises = makeVybraneGenerator().generate()
      const allIds = exercises.flatMap(e => e.blanks.map(b => b.id))
      expect(new Set(allIds).size).toBe(allIds.length)
    })
  })
})

