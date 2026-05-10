import type { ISkills } from './skill.entity'

export interface IProfile {
  id: string
  name: string
  avatarIndex: number         // index into a fixed emoji list
  totalXP: number
  level: number
  skillPoints: number         // unspent skill points (1 awarded per level-up)
  skills: ISkills             // purchased upgrade levels
  gamesPlayed: number
  totalCorrect: number
  totalAttempts: number
  streak: number              // consecutive days played
  lastPlayedDate: string      // ISO date string YYYY-MM-DD
  createdAt: string           // ISO timestamp
}

export interface IProfileStore {
  profiles: IProfile[]
  activeProfileId: string | null
}
