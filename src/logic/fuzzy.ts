/** Lowercase, drop accents and punctuation, collapse spaces. */
export function normalizeQuery(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length
  const row = Array.from({ length: b.length + 1 }, (_, index) => index)
  for (let i = 1; i <= a.length; i += 1) {
    let previous = row[0]
    row[0] = i
    for (let j = 1; j <= b.length; j += 1) {
      const saved = row[j]
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + cost)
      previous = saved
    }
  }
  return row[b.length]
}

function editsAllowed(length: number): number {
  if (length <= 4) return 1
  if (length <= 8) return 2
  return 3
}

function isAdjacentSwap(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  const diffs: number[] = []
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) diffs.push(i)
  }
  if (diffs.length !== 2 || diffs[1] !== diffs[0] + 1) return false
  return a[diffs[0]] === b[diffs[1]] && a[diffs[1]] === b[diffs[0]]
}

function wordScore(query: string, word: string): number {
  if (!query || !word) return 0
  if (query === word) return 100
  if (word.startsWith(query) || query.startsWith(word)) return 86
  const raw = levenshtein(query, word)
  const distance = raw === 2 && isAdjacentSwap(query, word) ? 1 : raw
  if (distance <= editsAllowed(Math.max(query.length, word.length))) return 80 - distance * 8
  return 0
}

/**
 * 0 means no match. 100 is exact.
 * A typo in one name part still counts. Every word in the query has to land near some word in the target.
 */
export function fuzzyScore(query: string, target: string): number {
  const q = normalizeQuery(query)
  const t = normalizeQuery(target)
  if (!q || !t) return 0
  if (q === t) return 100
  if (t.startsWith(q)) return 96
  if (t.includes(q)) return 88
  const words = q.split(' ')
  const targets = t.split(' ')
  let total = 0
  for (const word of words) {
    let best = 0
    for (const targetWord of targets) best = Math.max(best, wordScore(word, targetWord))
    if (best === 0) return 0
    total += best
  }
  return total / words.length
}

/** Keep a hit when the score is this high or better. One- and two-letter typos clear it. */
export const fuzzyCutoff = 60
