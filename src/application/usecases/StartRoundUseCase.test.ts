import { describe, it, expect, vi, beforeEach } from 'vitest'
import { StartRoundUseCase } from './StartRoundUseCase'
import type { IGameConfig } from '../../domain/entities/game.entity'
import type { IExerciseSource } from '../../domain/ports/IExerciseSource'

const mockSource: IExerciseSource = {
  load: vi.fn(),
  getWords: vi.fn((difficulty: number) => {
    const pool: Record<number, string[]> = {
      1: ['víla', 'sýty', 'myší', 'ryby'],
      2: ['bicykel', 'divina', 'výzva', 'tíšina'],
      3: ['bylina', 'básnik', 'výklad', 'písmeno'],
      4: ['histórika', 'výsledok', 'fyzicky', 'myslivec'],
    }
    return pool[difficulty] ?? []
  }),
  getSentences: vi.fn(() => [
    'Ryba pláva v rieke.',
    'Víla tancuje v lese.',
    'Sýty vlk líže si pysky.',
    'Básnik píše básne.',
    'Bicykel stojí pri plote.',
    'Výzva je pred nami.',
    'Tíšina vládne v noci.',
    'Bylina rastie na lúke.',
  ]),
  getVybraneSlovaWords: vi.fn(() => ({
    words: ['byť', 'bylina', 'nábytok', 'biely', 'bicykel', 'biológia', 'bitka'],
    notes: { byť: 'existovať, nachádzať sa', biť: 'udierať' },
  })),
}

const wordConfig: IGameConfig = {
  mode: 'words',
  exercisesPerRound: 6,
  maxHearts: 3,
  timerEnabled: false,
  secondsPerExercise: 30,
  difficultyLevel: 2,
  hintsPerRound: 0,
  skipsPerRound: 0,
}

const sentenceConfig: IGameConfig = { ...wordConfig, mode: 'sentences' }

const vybraneConfig: IGameConfig = {
  ...wordConfig,
  mode: 'vybrane-slova',
  vybraneSlovaGroup: 'b',
}

describe('StartRoundUseCase', () => {
  let useCase: StartRoundUseCase

  beforeEach(() => {
    useCase = new StartRoundUseCase(mockSource)
  })

  it('returns the configured number of exercises', () => {
    const { exercises } = useCase.execute(wordConfig)
    expect(exercises).toHaveLength(6)
  })

  it('returns exercises of correct type in word mode', () => {
    const { exercises } = useCase.execute(wordConfig)
    exercises.forEach(e => expect(e.type).toBe('word'))
  })

  it('returns exercises of correct type in sentence mode', () => {
    const { exercises } = useCase.execute(sentenceConfig)
    exercises.forEach(e => expect(e.type).toBe('sentence'))
  })

  it('returns gameState with status playing', () => {
    const { gameState } = useCase.execute(wordConfig)
    expect(gameState.status).toBe('playing')
  })

  it('initialises hearts from config', () => {
    const { gameState } = useCase.execute(wordConfig)
    expect(gameState.hearts).toBe(3)
  })

  it('sets timerSecondsLeft to 0 when timer disabled', () => {
    const { gameState } = useCase.execute(wordConfig)
    expect(gameState.timerSecondsLeft).toBe(0)
  })

  it('sets timerSecondsLeft from config when timer enabled', () => {
    const timedConfig: IGameConfig = { ...wordConfig, timerEnabled: true, secondsPerExercise: 20 }
    const { gameState } = useCase.execute(timedConfig)
    expect(gameState.timerSecondsLeft).toBe(20)
  })

  it('sets currentExerciseIndex to 0', () => {
    const { gameState } = useCase.execute(wordConfig)
    expect(gameState.currentExerciseIndex).toBe(0)
  })

  it('initialises hintsLeft from config hintsPerRound', () => {
    const config: IGameConfig = { ...wordConfig, hintsPerRound: 2 }
    const { gameState } = useCase.execute(config)
    expect(gameState.hintsLeft).toBe(2)
  })

  it('initialises skipsLeft from config skipsPerRound', () => {
    const config: IGameConfig = { ...wordConfig, skipsPerRound: 1 }
    const { gameState } = useCase.execute(config)
    expect(gameState.skipsLeft).toBe(1)
  })

  it('sets hintsLeft to 0 when hintsPerRound is 0', () => {
    const { gameState } = useCase.execute(wordConfig)
    expect(gameState.hintsLeft).toBe(0)
  })

  describe('vybrane-slova mode', () => {
    it('calls getVybraneSlovaWords with the configured group', () => {
      useCase.execute(vybraneConfig)
      expect(mockSource.getVybraneSlovaWords).toHaveBeenCalledWith('b')
    })

    it('returns exercises of type "word"', () => {
      const { exercises } = useCase.execute(vybraneConfig)
      exercises.forEach(e => expect(e.type).toBe('word'))
    })

    it('returns gameState with status playing', () => {
      const { gameState } = useCase.execute(vybraneConfig)
      expect(gameState.status).toBe('playing')
    })

    it('exercises include note when word is in notes map', () => {
      const { exercises } = useCase.execute(vybraneConfig)
      const withNote = exercises.find(e => e.originalText === 'byť')
      if (withNote) {
        expect(withNote.note).toBe('existovať, nachádzať sa')
      }
    })
  })
})

