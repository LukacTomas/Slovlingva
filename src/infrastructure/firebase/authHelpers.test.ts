import { describe, it, expect } from 'vitest'
import { validateUsername, validatePassword, usernameToEmail } from './authHelpers'

describe('validateUsername', () => {
  it('returns error when username is too short', () => {
    expect(validateUsername('ab')).toBe('Meno musí mať aspoň 3 znaky')
    expect(validateUsername('a')).toBe('Meno musí mať aspoň 3 znaky')
    expect(validateUsername('')).toBe('Meno musí mať aspoň 3 znaky')
  })

  it('returns error when username is too long', () => {
    expect(validateUsername('a'.repeat(21))).toBe('Meno môže mať najviac 20 znakov')
  })

  it('returns error for invalid characters', () => {
    expect(validateUsername('user name')).toBe('Meno môže obsahovať len písmená, čísla, _ a -')
    expect(validateUsername('user@name')).toBe('Meno môže obsahovať len písmená, čísla, _ a -')
    expect(validateUsername('user.name')).toBe('Meno môže obsahovať len písmená, čísla, _ a -')
    expect(validateUsername('ščťžý')).toBe('Meno môže obsahovať len písmená, čísla, _ a -')
  })

  it('returns null for valid usernames', () => {
    expect(validateUsername('abc')).toBeNull()
    expect(validateUsername('user_name')).toBeNull()
    expect(validateUsername('user-name')).toBeNull()
    expect(validateUsername('User123')).toBeNull()
    expect(validateUsername('a'.repeat(20))).toBeNull()
  })

  it('trims whitespace before validation', () => {
    expect(validateUsername('  abc  ')).toBeNull()
    expect(validateUsername('  ab  ')).toBe('Meno musí mať aspoň 3 znaky')
  })
})

describe('validatePassword', () => {
  it('returns error when password is too short', () => {
    expect(validatePassword('')).toBe('Heslo musí mať aspoň 6 znakov')
    expect(validatePassword('12345')).toBe('Heslo musí mať aspoň 6 znakov')
  })

  it('returns null for valid passwords', () => {
    expect(validatePassword('123456')).toBeNull()
    expect(validatePassword('heslo123')).toBeNull()
    expect(validatePassword('a very long password')).toBeNull()
  })
})

describe('usernameToEmail', () => {
  it('converts username to lowercase synthetic email', () => {
    expect(usernameToEmail('TestUser')).toBe('testuser@slovlingva.app')
  })

  it('trims whitespace', () => {
    expect(usernameToEmail('  user  ')).toBe('user@slovlingva.app')
  })
})
