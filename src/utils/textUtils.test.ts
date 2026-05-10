import { describe, it, expect } from 'vitest'
import { blankOutTargetChars } from './textUtils'

describe('blankOutTargetChars', () => {

  it('returns one text part and no blanks when no target chars present', () => {
    const result = blankOutTargetChars('mačka')
    expect(result.parts).toHaveLength(1)
    expect(result.parts[0]).toEqual({ type: 'text', content: 'mačka' })
    expect(result.blanks).toHaveLength(0)
  })

  it('creates a blank for each lowercase target char', () => {
    const result = blankOutTargetChars('bylina')
    expect(result.blanks).toHaveLength(2)
    expect(result.blanks[0].correctChar).toBe('y')
    expect(result.blanks[1].correctChar).toBe('i')
  })

  it('handles long accented targets í and ý', () => {
    const result = blankOutTargetChars('kríž')
    expect(result.blanks).toHaveLength(1)
    expect(result.blanks[0].correctChar).toBe('í')
  })

  it('produces alternating text/blank parts', () => {
    // "bylina" → text("b") blank(y) text("l") blank(i) text("na")
    const result = blankOutTargetChars('bylina')
    expect(result.parts.map(p => p.type))
      .toEqual(['text', 'blank', 'text', 'blank', 'text'])
  })

  it('handles a target char at the very start', () => {
    const result = blankOutTargetChars('ihla')
    expect(result.parts[0].type).toBe('blank')
    expect(result.blanks[0].correctChar).toBe('i')
  })

  it('handles a target char at the very end', () => {
    const result = blankOutTargetChars('vlky')
    expect(result.parts[result.parts.length - 1].type).toBe('blank')
    expect(result.blanks[0].correctChar).toBe('y')
  })

  it('handles consecutive target chars as separate blanks', () => {
    const result = blankOutTargetChars('iii')
    expect(result.blanks).toHaveLength(3)
    expect(result.parts.every(p => p.type === 'blank')).toBe(true)
  })

  it('all blanks start with filledChar null and state empty', () => {
    const { blanks } = blankOutTargetChars('bylina')
    blanks.forEach(b => {
      expect(b.filledChar).toBeNull()
      expect(b.state).toBe('empty')
    })
  })

  it('each blank has a unique id', () => {
    const { blanks } = blankOutTargetChars('vitamín')
    const ids = blanks.map(b => b.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('charIndex matches position in original string', () => {
    // "syn" → s(0) y(1) n(2) — blank at index 1
    const { blanks } = blankOutTargetChars('syn')
    expect(blanks[0].charIndex).toBe(1)
  })

})
