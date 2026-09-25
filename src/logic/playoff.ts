import { nflTeams, type Conference } from '@/src/config/nflTeams'
import type { SlateGame, StandingRow } from '@/src/data/types'

export type PlayoffTeam = {
  id: string
  abbr: string
  name: string
  record: string
  seed: number
  conference: Conference
}

export type PlayoffPair = { home: PlayoffTeam; away: PlayoffTeam }

export type PlayoffSide = {
  conference: Conference
  /** Seeds 1–7. Seed 1 would have the bye. */
  field: PlayoffTeam[]
  outside: PlayoffTeam[]
  /** Wild-card games if the season ended on the current seeds. Higher seed is at home. */
  wildCard: PlayoffPair[]
}

const wildCardSeeds: [number, number][] = [
  [2, 7],
  [3, 6],
  [4, 5],
]

/** ESPN's seed is the current playoff order. The league reseeds after the wild-card weekend. */
export function playoffPicture(rows: StandingRow[]): PlayoffSide[] {
  const byId = new Map(nflTeams.map((team) => [team.id, team]))
  const grouped = new Map<Conference, PlayoffTeam[]>()
  for (const row of rows) {
    const team = byId.get(row.teamId)
    if (!team || !row.seed) continue
    const list = grouped.get(team.conference) ?? []
    list.push({
      id: team.id,
      abbr: team.abbr,
      name: team.name,
      record: row.record,
      seed: row.seed,
      conference: team.conference,
    })
    grouped.set(team.conference, list)
  }
  return (['AFC', 'NFC'] as Conference[]).flatMap((conference) => {
    const ranked = (grouped.get(conference) ?? []).sort((a, b) => a.seed - b.seed)
    if (!ranked.length) return []
    const bySeed = new Map(ranked.map((team) => [team.seed, team]))
    const wildCard = wildCardSeeds.flatMap(([homeSeed, awaySeed]) => {
      const home = bySeed.get(homeSeed)
      const away = bySeed.get(awaySeed)
      if (!home || !away) return []
      return [{ home, away }]
    })
    return [
      {
        conference,
        field: ranked.filter((team) => team.seed <= 7),
        outside: ranked.filter((team) => team.seed > 7),
        wildCard,
      },
    ]
  })
}

export function roundLabel(game: SlateGame): string {
  const week = (game.week || '').toLowerCase()
  if (week.includes('wild')) return 'Wild card'
  if (week.includes('divis')) return 'Divisional'
  if (week.includes('conference')) return 'Conference'
  if (week.includes('super')) return 'Super Bowl'
  return game.week || 'Playoffs'
}
