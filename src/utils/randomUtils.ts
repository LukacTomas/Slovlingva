export function shuffleArray<T>(array: T[]): T[] {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function pickRandom<T>(array: T[], n: number): T[] {
  if (n > array.length) {
    throw new Error(
      `Cannot pick ${n} items from array of length ${array.length}`,
    )
  }
  if (n === 0) return []
  return shuffleArray(array).slice(0, n)
}
