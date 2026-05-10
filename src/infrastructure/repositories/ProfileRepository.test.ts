import { describe, it, expect, beforeEach } from 'vitest'
import { ProfileRepository } from './ProfileRepository'
import { LocalStorageAdapter } from '../storage/LocalStorageAdapter'
import { DEFAULT_SKILLS } from '../../domain/entities/skill.entity'
import type { IProfile } from '../../domain/entities/profile.entity'

function makeProfile(overrides: Partial<IProfile> = {}): IProfile {
  return {
    id: `test-${Math.random().toString(36).slice(2)}`,
    name: 'Alice',
    avatarIndex: 0,
    totalXP: 0,
    level: 1,
    skillPoints: 0,
    skills: { ...DEFAULT_SKILLS },
    gamesPlayed: 0,
    totalCorrect: 0,
    totalAttempts: 0,
    streak: 0,
    lastPlayedDate: '',
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

describe('ProfileRepository', () => {
  let repo: ProfileRepository

  beforeEach(() => {
    localStorage.clear()
    repo = new ProfileRepository(new LocalStorageAdapter())
  })

  describe('findAll', () => {
    it('returns empty array when no profiles exist', () => {
      expect(repo.findAll()).toEqual([])
    })

    it('returns all saved profiles', () => {
      repo.save(makeProfile({ id: '1', name: 'Alice' }))
      repo.save(makeProfile({ id: '2', name: 'Bob' }))
      expect(repo.findAll()).toHaveLength(2)
    })
  })

  describe('findById', () => {
    it('returns null when profile does not exist', () => {
      expect(repo.findById('ghost')).toBeNull()
    })

    it('returns the correct profile', () => {
      const p = makeProfile({ id: '42', name: 'Alice' })
      repo.save(p)
      expect(repo.findById('42')?.name).toBe('Alice')
    })
  })

  describe('save', () => {
    it('inserts a new profile', () => {
      repo.save(makeProfile({ id: '1' }))
      expect(repo.findAll()).toHaveLength(1)
    })

    it('updates an existing profile', () => {
      const p = makeProfile({ id: '1', totalXP: 0 })
      repo.save(p)
      repo.save({ ...p, totalXP: 200 })
      expect(repo.findById('1')?.totalXP).toBe(200)
      expect(repo.findAll()).toHaveLength(1)
    })

    it('persists across instances', () => {
      repo.save(makeProfile({ id: '1' }))
      const fresh = new ProfileRepository(new LocalStorageAdapter())
      expect(fresh.findAll()).toHaveLength(1)
    })
  })

  describe('delete', () => {
    it('removes the profile', () => {
      repo.save(makeProfile({ id: '1' }))
      repo.delete('1')
      expect(repo.findAll()).toHaveLength(0)
    })

    it('clears activeId if the deleted profile was active', () => {
      repo.save(makeProfile({ id: '1' }))
      repo.setActiveId('1')
      repo.delete('1')
      expect(repo.getActiveId()).toBeNull()
    })
  })

  describe('getActiveId / setActiveId', () => {
    it('returns null when no active id is set', () => {
      expect(repo.getActiveId()).toBeNull()
    })

    it('returns the id after setActiveId', () => {
      repo.setActiveId('abc')
      expect(repo.getActiveId()).toBe('abc')
    })

    it('accepts null to clear active id', () => {
      repo.setActiveId('abc')
      repo.setActiveId(null)
      expect(repo.getActiveId()).toBeNull()
    })
  })
})
