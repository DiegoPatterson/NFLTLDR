/**
 * Home-screen focus. See docs/memories/plan.md, "Home states".
 * Do not reimplement this inside a screen.
 *
 * Any live game can be in front. The first time your team's game is live,
 * it takes the front once and the previous game falls into the strip.
 * A tap (pin) sticks until a new game of yours starts.
 */
export type FocusState = 'pre' | 'in' | 'post'

export type FocusGame = {
  id: string
  state: FocusState
  teamIds: string[]
}

export type FocusMemory = {
  focusedGameId: string | null
  userPinnedGameId: string | null
  autoPromotedIds: string[]
}

export const emptyFocus: FocusMemory = {
  focusedGameId: null,
  userPinnedGameId: null,
  autoPromotedIds: [],
}

export function pinGame(memory: FocusMemory, gameId: string): FocusMemory {
  return { ...memory, focusedGameId: gameId, userPinnedGameId: gameId }
}

export function resolveFocus(
  memory: FocusMemory,
  games: FocusGame[],
  primaryTeamId: string | null,
): { memory: FocusMemory; mode: 'live' | 'digest'; focusedGameId: string | null } {
  const live = games.filter((game) => game.state === 'in')
  if (live.length === 0) {
    return { memory, mode: 'digest', focusedGameId: null }
  }

  const mine = primaryTeamId
    ? live.find((game) => game.teamIds.includes(primaryTeamId))
    : undefined

  const next: FocusMemory = {
    ...memory,
    autoPromotedIds: memory.autoPromotedIds.slice(-20),
  }

  if (mine && !next.autoPromotedIds.includes(mine.id)) {
    next.autoPromotedIds = [...next.autoPromotedIds, mine.id].slice(-20)
    next.focusedGameId = mine.id
    next.userPinnedGameId = null
    return { memory: next, mode: 'live', focusedGameId: mine.id }
  }

  if (next.userPinnedGameId && live.some((game) => game.id === next.userPinnedGameId)) {
    next.focusedGameId = next.userPinnedGameId
    return { memory: next, mode: 'live', focusedGameId: next.userPinnedGameId }
  }

  if (next.focusedGameId && live.some((game) => game.id === next.focusedGameId)) {
    return { memory: next, mode: 'live', focusedGameId: next.focusedGameId }
  }

  const fallback = mine?.id ?? live[0].id
  next.focusedGameId = fallback
  next.userPinnedGameId = null
  return { memory: next, mode: 'live', focusedGameId: fallback }
}
