import { nextSlot } from './lineup'
import type { RosterSlots } from '@/src/config/fantasyPresets'

const limits: RosterSlots = { qb: 1, rb: 2, wr: 2, te: 1, flex: 1, dst: 1, k: 1, bench: 1 }

function assertEqual(actual: unknown, expected: unknown, label: string) {
  if (actual !== expected) throw new Error(`${label}: expected ${String(expected)} but got ${String(actual)}`)
}

assertEqual(nextSlot('QB', [], limits), 'qb', 'first qb')
assertEqual(nextSlot('QB', [{ slot: 'qb' }], limits), 'bench', 'qb spills to bench')
assertEqual(nextSlot('QB', [{ slot: 'qb' }, { slot: 'bench' }], limits), null, 'qb sheet full')
assertEqual(nextSlot('WR', [{ slot: 'wr' }, { slot: 'wr' }], limits), 'flex', 'wr uses flex')
assertEqual(nextSlot('LB', [], limits), null, 'defender stays off')
assertEqual(nextSlot('DST', [], limits), 'dst', 'defense')

console.log('lineup ok')
