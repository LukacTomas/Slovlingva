import { describe, it, expect } from 'vitest'
import { isValidPin, hashPin, verifyPin } from './pinUtils'

describe('isValidPin', () => {
  it('accepts exactly 4 digits', () => {
    expect(isValidPin('1234')).toBe(true)
    expect(isValidPin('0000')).toBe(true)
    expect(isValidPin('9999')).toBe(true)
  })

  it('rejects fewer than 4 digits', () => {
    expect(isValidPin('123')).toBe(false)
    expect(isValidPin('')).toBe(false)
  })

  it('rejects more than 4 digits', () => {
    expect(isValidPin('12345')).toBe(false)
  })

  it('rejects non-digit characters', () => {
    expect(isValidPin('abcd')).toBe(false)
    expect(isValidPin('12a4')).toBe(false)
    expect(isValidPin('12 4')).toBe(false)
  })
})

describe('hashPin', () => {
  it('returns a hex string', () => {
    const hash = hashPin('1234')
    expect(hash).toMatch(/^[0-9a-f]{16}$/)
  })

  it('returns the same hash for the same PIN', () => {
    expect(hashPin('1234')).toBe(hashPin('1234'))
  })

  it('returns different hashes for different PINs', () => {
    expect(hashPin('1234')).not.toBe(hashPin('4321'))
    expect(hashPin('0000')).not.toBe(hashPin('9999'))
  })

  it('throws for invalid PINs', () => {
    expect(() => hashPin('abc')).toThrow(/4 digits/)
    expect(() => hashPin('12345')).toThrow(/4 digits/)
    expect(() => hashPin('')).toThrow(/4 digits/)
  })
})

describe('verifyPin', () => {
  it('returns true for matching PIN', () => {
    const hash = hashPin('5678')
    expect(verifyPin('5678', hash)).toBe(true)
  })

  it('returns false for wrong PIN', () => {
    const hash = hashPin('5678')
    expect(verifyPin('1234', hash)).toBe(false)
  })

  it('returns false for invalid PIN format without throwing', () => {
    const hash = hashPin('1234')
    expect(verifyPin('abc', hash)).toBe(false)
    expect(verifyPin('', hash)).toBe(false)
  })
})
