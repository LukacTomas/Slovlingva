import { describe, it, expect } from 'vitest'
import { xpForLevel, levelFromXP, xpProgressInLevel } from './levelUtils'

describe('xpForLevel', () => {

  it('level 1 starts at 0 XP', () => {
    expect(xpForLevel(1)).toBe(0)
  })

  it('level 2 starts at 100 XP', () => {
    expect(xpForLevel(2)).toBe(100)
  })

  it('each threshold is strictly greater than the previous', () => {
    for (let lvl = 2; lvl <= 10; lvl++) {
      expect(xpForLevel(lvl)).toBeGreaterThan(xpForLevel(lvl - 1))
    }
  })

})

describe('levelFromXP', () => {

  it('0 XP is level 1', () => {
    expect(levelFromXP(0)).toBe(1)
  })

  it('99 XP is still level 1', () => {
    expect(levelFromXP(99)).toBe(1)
  })

  it('exactly 100 XP is level 2', () => {
    expect(levelFromXP(100)).toBe(2)
  })

  it('never returns 0 or negative', () => {
    expect(levelFromXP(0)).toBeGreaterThanOrEqual(1)
  })

  it('very large XP returns a high level', () => {
    expect(levelFromXP(999999)).toBeGreaterThan(5)
  })

})

describe('xpProgressInLevel', () => {

  it('returns 0 at the exact start of a level', () => {
    expect(xpProgressInLevel(0)).toBe(0)
    expect(xpProgressInLevel(100)).toBe(0)
  })

  it('returns a value between 0 and 1', () => {
    const progress = xpProgressInLevel(150)
    expect(progress).toBeGreaterThan(0)
    expect(progress).toBeLessThan(1)
  })

  it('returns exactly 1 at the start of the next level', () => {
    const mid = xpProgressInLevel(150)
    expect(mid).toBeGreaterThan(0)
    expect(mid).toBeLessThanOrEqual(1)
  })

})
