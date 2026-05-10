import { describe, it, expect } from 'vitest'
import { pickRandom, shuffleArray } from './randomUtils'

describe('pickRandom', () => {

  it('returns exactly n items', () => {
    const result = pickRandom([1, 2, 3, 4, 5], 3)
    expect(result).toHaveLength(3)
  })

  it('returns no duplicates', () => {
    const result = pickRandom([1, 2, 3, 4, 5, 6, 7, 8], 6)
    expect(new Set(result).size).toBe(6)
  })

  it('returns all items when n equals array length', () => {
    const arr = [1, 2, 3]
    const result = pickRandom(arr, 3)
    expect(result).toHaveLength(3)
  })

  it('returns empty array when n is 0', () => {
    expect(pickRandom([1, 2, 3], 0)).toEqual([])
  })

  it('throws when n exceeds array length', () => {
    expect(() => pickRandom([1, 2], 5)).toThrow()
  })

  it('works with string arrays', () => {
    const words = ['ryba', 'syn', 'bylina', 'kríž']
    const result = pickRandom(words, 2)
    expect(result).toHaveLength(2)
    result.forEach(w => expect(words).toContain(w))
  })

})

describe('shuffleArray', () => {

  it('returns an array of the same length', () => {
    expect(shuffleArray([1, 2, 3, 4])).toHaveLength(4)
  })

  it('contains all original elements', () => {
    const arr = [1, 2, 3, 4, 5]
    const shuffled = shuffleArray(arr)
    expect(shuffled.sort()).toEqual([...arr].sort())
  })

  it('does not mutate the original array', () => {
    const arr = [1, 2, 3]
    const copy = [...arr]
    shuffleArray(arr)
    expect(arr).toEqual(copy)
  })

})
