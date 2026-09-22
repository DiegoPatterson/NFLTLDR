import type { Scoring } from '@/src/config/fantasyPresets'
import { copy } from '@/src/config/copy'
import { statLabels } from '@/src/config/statCatalog'

const RULES: [keyof Scoring, string][] = [
  ['passYd', 'passingYards'],
  ['passTd', 'passingTouchdowns'],
  ['passInt', 'interceptions'],
  ['rushYd', 'rushingYards'],
  ['rushTd', 'rushingTouchdowns'],
  ['rec', 'receptions'],
  ['recYd', 'receivingYards'],
  ['recTd', 'receivingTouchdowns'],
  ['fum', 'fumblesLost'],
]

export function estimatePoints(
  numbers: Record<string, number>,
  scoring: Scoring,
): { points: number; counted: number } {
  let points = 0
  let counted = 0
  for (const [rule, stat] of RULES) {
    const value = numbers[stat]
    if (value == null || Number.isNaN(value)) continue
    points += value * scoring[rule]
    counted += 1
  }
  return { points, counted }
}

export function formatPoints(points: number): string {
  const rounded = Math.round(points * 10) / 10
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
}

const GLANCE_ORDER = ['passingYards', 'rushingYards', 'receivingYards', 'sacks', 'totalTackles']

export function glance(
  a: { name: string; position: string; numbers: Record<string, number> },
  b: { name: string; position: string; numbers: Record<string, number> },
): string {
  if (a.position && b.position && a.position !== b.position) {
    return 'Pick two players who play the same position.'
  }
  for (const key of GLANCE_ORDER) {
    const av = a.numbers[key]
    const bv = b.numbers[key]
    if (av == null || bv == null) continue
    const label = (statLabels[key] ?? key).toLowerCase()
    if (av === bv) return `Same ${label} (${av}). ${copy.glanceDisclaimer}`
    const top = av > bv ? a : b
    const bot = top === a ? b : a
    const hi = Math.max(av, bv)
    const lo = Math.min(av, bv)
    return `${top.name} has more ${label} (${hi} to ${lo}). ${copy.glanceDisclaimer}`
  }
  return `No shared counting stat to line those two up. ${copy.glanceDisclaimer}`
}
