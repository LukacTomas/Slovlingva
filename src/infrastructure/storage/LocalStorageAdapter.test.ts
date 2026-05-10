import { describe, it, expect, beforeEach, vi } from 'vitest'
import { LocalStorageAdapter } from './LocalStorageAdapter'

describe('LocalStorageAdapter', () => {
  let storage: LocalStorageAdapter

  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
    storage = new LocalStorageAdapter()
  })

  describe('get', () => {
    it('returns null when key does not exist', () => {
      expect(storage.get('missing')).toBeNull()
    })

    it('returns the parsed value for an existing key', () => {
      localStorage.setItem('foo', JSON.stringify({ bar: 1 }))
      expect(storage.get<{ bar: number }>('foo')).toEqual({ bar: 1 })
    })

    it('returns null when stored value is invalid JSON', () => {
      localStorage.setItem('bad', 'not-json{{{')
      expect(storage.get('bad')).toBeNull()
    })
  })

  describe('set', () => {
    it('serialises and stores a value', () => {
      storage.set('key', { x: 42 })
      expect(JSON.parse(localStorage.getItem('key')!)).toEqual({ x: 42 })
    })

    it('overwrites an existing key', () => {
      storage.set('key', 'first')
      storage.set('key', 'second')
      expect(storage.get<string>('key')).toBe('second')
    })
  })

  describe('remove', () => {
    it('removes a key that exists', () => {
      storage.set('del', 'value')
      storage.remove('del')
      expect(storage.get('del')).toBeNull()
    })

    it('does not throw when key does not exist', () => {
      expect(() => storage.remove('ghost')).not.toThrow()
    })
  })

  describe('clear', () => {
    it('removes all keys', () => {
      storage.set('a', 1)
      storage.set('b', 2)
      storage.clear()
      expect(storage.get('a')).toBeNull()
      expect(storage.get('b')).toBeNull()
    })
  })
})
