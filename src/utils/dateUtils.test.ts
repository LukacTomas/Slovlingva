import { describe, it, expect } from 'vitest'
import { toISODateString, getYesterdayOf } from './dateUtils'

describe('toISODateString', () => {
  it('formats a mid-year date as YYYY-MM-DD', () => {
    expect(toISODateString(new Date(2024, 2, 15))).toBe('2024-03-15')
  })

  it('pads single-digit month and day with leading zeros', () => {
    expect(toISODateString(new Date(2024, 0, 5))).toBe('2024-01-05')
  })

  it('formats the last day of the year', () => {
    expect(toISODateString(new Date(2023, 11, 31))).toBe('2023-12-31')
  })
})

describe('getYesterdayOf', () => {
  it('returns the previous day within the same month', () => {
    expect(getYesterdayOf('2024-03-15')).toBe('2024-03-14')
  })

  it('crosses a month boundary (March → February, leap year)', () => {
    expect(getYesterdayOf('2024-03-01')).toBe('2024-02-29')
  })

  it('crosses a month boundary (March → February, non-leap year)', () => {
    expect(getYesterdayOf('2023-03-01')).toBe('2023-02-28')
  })

  it('crosses a year boundary', () => {
    expect(getYesterdayOf('2024-01-01')).toBe('2023-12-31')
  })
})
