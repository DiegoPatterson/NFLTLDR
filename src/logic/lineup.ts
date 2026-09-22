import type { RosterSlots } from '@/src/config/fantasyPresets'

export type SlotKey = keyof RosterSlots

export const slotOrder: SlotKey[] = ['qb', 'rb', 'wr', 'te', 'flex', 'dst', 'k', 'bench']

export const slotLabel: Record<SlotKey, string> = {
  qb: 'QB',
  rb: 'RB',
  wr: 'WR',
  te: 'TE',
  flex: 'FLEX',
  dst: 'DEF',
  k: 'K',
  bench: 'BENCH',
}

/** Starter spots a position may fill, then the bench. Empty means this player cannot go on the sheet. */
export function legalSlots(position: string): SlotKey[] {
  switch (position.toUpperCase()) {
    case 'QB':
      return ['qb', 'bench']
    case 'RB':
      return ['rb', 'flex', 'bench']
    case 'WR':
      return ['wr', 'flex', 'bench']
    case 'TE':
      return ['te', 'flex', 'bench']
    case 'K':
    case 'PK':
      return ['k', 'bench']
    case 'DST':
    case 'DEF':
      return ['dst', 'bench']
    default:
      return []
  }
}

export function nextSlot(
  position: string,
  taken: { slot: string }[],
  limits: RosterSlots,
): SlotKey | null {
  for (const slot of legalSlots(position)) {
    const used = taken.filter((entry) => entry.slot === slot).length
    if (used < limits[slot]) return slot
  }
  return null
}
