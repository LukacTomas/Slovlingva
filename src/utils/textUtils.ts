import type { IBlank, ITextPart, CharacterOption } from '../domain/entities/exercise.entity'

const TARGET_CHARS = new Set<string>(['i', 'í', 'y', 'ý'])

interface BlankOutResult {
  parts: ITextPart[]
  blanks: IBlank[]
}

export function blankOutTargetChars(text: string): BlankOutResult {
  const parts: ITextPart[] = []
  const blanks: IBlank[] = []
  let buffer = ''
  let blankCounter = 0

  for (let i = 0; i < text.length; i++) {
    const char = text[i]

    if (TARGET_CHARS.has(char)) {
      if (buffer.length > 0) {
        parts.push({ type: 'text', content: buffer })
        buffer = ''
      }

      const blankId = `blank-${blankCounter++}`
      const blank: IBlank = {
        id: blankId,
        charIndex: i,
        correctChar: char as CharacterOption,
        filledChar: null,
        state: 'empty',
      }

      blanks.push(blank)
      parts.push({ type: 'blank', blankId })
    } else {
      buffer += char
    }
  }

  if (buffer.length > 0) {
    parts.push({ type: 'text', content: buffer })
  }

  return { parts, blanks }
}
