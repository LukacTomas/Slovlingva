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
    it('returns null when key does not exist', async () => {
      expect(await storage.get('missing')).toBeNull()
    })

    it('returns the parsed value for an existing key', async () => {
      localStorage.setItem('foo', JSON.stringify({ bar: 1 }))
      expect(await storage.get<{ bar: number }>('foo')).toEqual({ bar: 1 })
    })

    it('returns null when stored value is invalid JSON', async () => {
      localStorage.setItem('bad', 'not-json{{{')
      expect(await storage.get('bad')).toBeNull()
    })
  })

  describe('set', () => {
    it('serialises and stores a value', async () => {
      await storage.set('key', { x: 42 })
      expect(JSON.parse(localStorage.getItem('key')!)).toEqual({ x: 42 })
    })

    it('overwrites an existing key', async () => {
      await storage.set('key', 'first')
      await storage.set('key', 'second')
      expect(await storage.get<string>('key')).toBe('second')
    })
  })

  describe('remove', () => {
    it('removes a key that exists', async () => {
      await storage.set('del', 'value')
      await storage.remove('del')
      expect(await storage.get('del')).toBeNull()
    })

    it('does not throw when key does not exist', async () => {
      await expect(storage.remove('ghost')).resolves.not.toThrow()
    })
  })

  describe('clear', () => {
    it('removes all keys', async () => {
      await storage.set('a', 1)
      await storage.set('b', 2)
      await storage.clear()
      expect(await storage.get('a')).toBeNull()
      expect(await storage.get('b')).toBeNull()
    })
  })
})
