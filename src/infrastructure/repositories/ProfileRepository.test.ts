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
    it('returns empty array when no profiles exist', async () => {
      expect(await repo.findAll()).toEqual([])
    })

    it('returns all saved profiles', async () => {
      await repo.save(makeProfile({ id: '1', name: 'Alice' }))
      await repo.save(makeProfile({ id: '2', name: 'Bob' }))
      expect(await repo.findAll()).toHaveLength(2)
    })
  })

  describe('findById', () => {
    it('returns null when profile does not exist', async () => {
      expect(await repo.findById('ghost')).toBeNull()
    })

    it('returns the correct profile', async () => {
      const p = makeProfile({ id: '42', name: 'Alice' })
      await repo.save(p)
      expect((await repo.findById('42'))?.name).toBe('Alice')
    })
  })

  describe('save', () => {
    it('inserts a new profile', async () => {
      await repo.save(makeProfile({ id: '1' }))
      expect(await repo.findAll()).toHaveLength(1)
    })

    it('updates an existing profile', async () => {
      const p = makeProfile({ id: '1', totalXP: 0 })
      await repo.save(p)
      await repo.save({ ...p, totalXP: 200 })
      expect((await repo.findById('1'))?.totalXP).toBe(200)
      expect(await repo.findAll()).toHaveLength(1)
    })

    it('persists across instances', async () => {
      await repo.save(makeProfile({ id: '1' }))
      const fresh = new ProfileRepository(new LocalStorageAdapter())
      expect(await fresh.findAll()).toHaveLength(1)
    })
  })

  describe('delete', () => {
    it('removes the profile', async () => {
      await repo.save(makeProfile({ id: '1' }))
      await repo.delete('1')
      expect(await repo.findAll()).toHaveLength(0)
    })

    it('clears activeId if the deleted profile was active', async () => {
      await repo.save(makeProfile({ id: '1' }))
      await repo.setActiveId('1')
      await repo.delete('1')
      expect(await repo.getActiveId()).toBeNull()
    })
  })

  describe('getActiveId / setActiveId', () => {
    it('returns null when no active id is set', async () => {
      expect(await repo.getActiveId()).toBeNull()
    })

    it('returns the id after setActiveId', async () => {
      await repo.setActiveId('abc')
      expect(await repo.getActiveId()).toBe('abc')
    })

    it('accepts null to clear active id', async () => {
      await repo.setActiveId('abc')
      await repo.setActiveId(null)
      expect(await repo.getActiveId()).toBeNull()
    })
  })
})
