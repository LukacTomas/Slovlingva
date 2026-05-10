import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DataLoader } from './DataLoader'
import type { IWordsData, ISentencesData, IVybraneSlovaData } from '../../domain/entities/data.entity'

const mockWords: IWordsData = {
  '1': ['myš', 'pes'],
  '2': ['ryba', 'koza'],
  '3': ['auto', 'vlak'],
  '4': ['bicykel', 'traktor'],
}

const mockSentences: ISentencesData = {
  sentences: ['Ryba pláva.', 'Pes beží.'],
}

const mockVybrane: IVybraneSlovaData = {
  b: { y_words: ['byť', 'bylina'], i_words: ['biely', 'bicykel'], notes: { byť: 'existovať', biť: 'udierať' } },
  m: { y_words: ['myš', 'myseľ'], i_words: ['milý', 'miesto'], notes: {} },
  p: { y_words: ['pýcha', 'pysk'], i_words: ['písmo', 'piatok'], notes: {} },
  r: { y_words: ['ryba', 'rytmus'], i_words: ['rieka', 'riad'], notes: {} },
  s: { y_words: ['syn', 'syr'], i_words: ['sila', 'sivý'], notes: {} },
  v: { y_words: ['výber', 'výr'], i_words: ['víla', 'víno'], notes: {} },
  z: { y_words: ['jazyk', 'nazývať'], i_words: ['zima', 'zinok'], notes: {} },
}

function makeFetch(words: IWordsData, sentences: ISentencesData, vybrane: IVybraneSlovaData) {
  return vi.fn((url: string) => {
    let body: unknown
    if (url.includes('words_game')) body = words
    else if (url.includes('diktaty')) body = sentences
    else body = vybrane
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(body),
    } as Response)
  })
}

describe('DataLoader', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('loads words and sentences on load()', async () => {
    vi.stubGlobal('fetch', makeFetch(mockWords, mockSentences, mockVybrane))
    const loader = new DataLoader()
    await loader.load()
    expect(loader.getWords(1)).toEqual(['myš', 'pes'])
    expect(loader.getSentences()).toEqual(['Ryba pláva.', 'Pes beží.'])
  })

  it('getWords returns correct tier for each difficulty', async () => {
    vi.stubGlobal('fetch', makeFetch(mockWords, mockSentences, mockVybrane))
    const loader = new DataLoader()
    await loader.load()
    expect(loader.getWords(2)).toEqual(['ryba', 'koza'])
    expect(loader.getWords(3)).toEqual(['auto', 'vlak'])
    expect(loader.getWords(4)).toEqual(['bicykel', 'traktor'])
  })

  it('throws if getWords is called before load()', () => {
    const loader = new DataLoader()
    expect(() => loader.getWords(1)).toThrow()
  })

  it('throws if getSentences is called before load()', () => {
    const loader = new DataLoader()
    expect(() => loader.getSentences()).toThrow()
  })

  it('throws when fetch returns ok: false', async () => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({ ok: false, status: 404 } as Response)
    ))
    const loader = new DataLoader()
    await expect(loader.load()).rejects.toThrow()
  })

  describe('getVybraneSlovaWords', () => {
    it('throws if called before load()', () => {
      const loader = new DataLoader()
      expect(() => loader.getVybraneSlovaWords('b')).toThrow()
    })

    it('returns merged y_words and i_words for a single group', async () => {
      vi.stubGlobal('fetch', makeFetch(mockWords, mockSentences, mockVybrane))
      const loader = new DataLoader()
      await loader.load()
      const { words } = loader.getVybraneSlovaWords('b')
      expect(words).toContain('byť')
      expect(words).toContain('bylina')
      expect(words).toContain('biely')
      expect(words).toContain('bicykel')
    })

    it('returns all words combined for mix group', async () => {
      vi.stubGlobal('fetch', makeFetch(mockWords, mockSentences, mockVybrane))
      const loader = new DataLoader()
      await loader.load()
      const { words } = loader.getVybraneSlovaWords('mix')
      // must contain words from every group
      expect(words).toContain('byť')    // b
      expect(words).toContain('myš')    // m
      expect(words).toContain('pýcha')  // p
      expect(words).toContain('ryba')   // r
      expect(words).toContain('syn')    // s
      expect(words).toContain('výber')  // v
      expect(words).toContain('jazyk')  // z
    })

    it('returns notes for the requested group', async () => {
      vi.stubGlobal('fetch', makeFetch(mockWords, mockSentences, mockVybrane))
      const loader = new DataLoader()
      await loader.load()
      const { notes } = loader.getVybraneSlovaWords('b')
      expect(notes['byť']).toBe('existovať')
    })

    it('merges notes from all groups for mix', async () => {
      vi.stubGlobal('fetch', makeFetch(mockWords, mockSentences, mockVybrane))
      const loader = new DataLoader()
      await loader.load()
      const { notes } = loader.getVybraneSlovaWords('mix')
      expect(notes['byť']).toBe('existovať')
    })
  })
})

