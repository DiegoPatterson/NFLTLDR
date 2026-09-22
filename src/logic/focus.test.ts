import { emptyFocus, pinGame, resolveFocus, type FocusGame, type FocusMemory } from './focus'

function assertEqual(actual: unknown, expected: unknown, label: string) {
  if (actual !== expected) throw new Error(`${label}: expected ${String(expected)} but got ${String(actual)}`)
}

const other: FocusGame = { id: 'other', state: 'in', teamIds: ['10', '11'] }
const mine: FocusGame = { id: 'mine', state: 'in', teamIds: ['2', '8'] }
const later: FocusGame = { id: 'mine-2', state: 'in', teamIds: ['2', '9'] }

function live(memory: FocusMemory, games: FocusGame[], team = '2') {
  return resolveFocus(memory, games, team)
}

const quiet = live(emptyFocus, [{ ...other, state: 'pre' }])
assertEqual(quiet.mode, 'digest', 'quiet mode')
assertEqual(quiet.focusedGameId, null, 'quiet focus')

const strangers = live(emptyFocus, [other])
assertEqual(strangers.focusedGameId, 'other', 'stranger game')

const kickoff = live(emptyFocus, [other, mine])
assertEqual(kickoff.focusedGameId, 'mine', 'kickoff focus')
assertEqual(kickoff.memory.userPinnedGameId, null, 'kickoff clears pin')
if (!kickoff.memory.autoPromotedIds.includes('mine')) throw new Error('kickoff should remember the promotion')

const swapped = live(pinGame(kickoff.memory, 'other'), [other, mine])
assertEqual(swapped.focusedGameId, 'other', 'swap focus')
assertEqual(swapped.memory.userPinnedGameId, 'other', 'swap pin')

const stillPinned = live(swapped.memory, [other, mine])
assertEqual(stillPinned.focusedGameId, 'other', 'pin sticks')

const nextWeek = live(swapped.memory, [other, later])
assertEqual(nextWeek.focusedGameId, 'mine-2', 'new game takes over')
assertEqual(nextWeek.memory.userPinnedGameId, null, 'new game clears pin')

const endedPin = live(pinGame(kickoff.memory, 'other'), [mine])
assertEqual(endedPin.focusedGameId, 'mine', 'ended pin falls back')

console.log('focus ok')
