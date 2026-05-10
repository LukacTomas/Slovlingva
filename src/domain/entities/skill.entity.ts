export type SkillKey = 'heartSlots' | 'xpBoostLevel' | 'hintsPerRound' | 'skipCharges'

export interface ISkills {
  /** Each point adds +1 to maxHearts (cap 2 → max 5 hearts total) */
  heartSlots: number
  /** Each point adds +10% to XP earned per correct blank (cap 3 → max +30%) */
  xpBoostLevel: number
  /** Each point adds 1 hint charge per round (cap 3) */
  hintsPerRound: number
  /** Each point adds 1 skip charge per round (cap 2) */
  skipCharges: number
}

export const DEFAULT_SKILLS: ISkills = {
  heartSlots: 0,
  xpBoostLevel: 0,
  hintsPerRound: 0,
  skipCharges: 0,
}

/** Maximum level purchasable for each skill */
export const SKILL_CAPS: Record<SkillKey, number> = {
  heartSlots: 2,
  xpBoostLevel: 3,
  hintsPerRound: 3,
  skipCharges: 2,
}

/** SP cost per upgrade step (all skills cost the same) */
export const SKILL_SP_COST = 1

export interface ISkillMeta {
  key: SkillKey
  icon: string
  name: string
  description: (level: number) => string
}

export const SKILL_META: ISkillMeta[] = [
  {
    key: 'heartSlots',
    icon: '❤️',
    name: 'Extra srdce',
    description: (lvl) => `Začínaš s ${3 + lvl} srdcami namiesto 3`,
  },
  {
    key: 'xpBoostLevel',
    icon: '⚡',
    name: 'Zosilnenie XP',
    description: (lvl) => `+${lvl * 10} % XP za každú správnu odpoveď`,
  },
  {
    key: 'hintsPerRound',
    icon: '💡',
    name: 'Nápoveda',
    description: (lvl) => `${lvl} nápoveda${lvl > 1 ? 'y' : ''} na kolo — odhalí správne písmeno`,
  },
  {
    key: 'skipCharges',
    icon: '⏭',
    name: 'Preskočiť',
    description: (lvl) => `${lvl} preskočenie${lvl > 1 ? 'a' : ''} na kolo — bez straty srdca`,
  },
]
