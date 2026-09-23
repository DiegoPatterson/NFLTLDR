import { features } from '@/src/config/features'
import { nflTeams } from '@/src/config/nflTeams'
import { seasonSections, type StatSpec } from '@/src/config/statCatalog'
import { fuzzyCutoff, fuzzyScore } from '@/src/logic/fuzzy'
import { officialLogo } from '@/src/config/logos'
import { paint } from '@/src/logic/color'
import { teamTldr } from '@/src/logic/tldr'
import { cached } from '@/src/data/cache'
import {
  describeGame,
  fetchNews,
  fetchInjuryReport,
  fetchPlayerCard,
  fetchPlayerHits,
  fetchRosterInjuries,
  fetchRosterPlayers,
  fetchTeamNotes,
  fetchSchedule,
  fetchSeasonBag,
  fetchSlate,
  fetchStandings,
  fetchSummary,
  fetchTeamList,
  fetchTeamRaw,
  mapSummary,
  profileFromTeam,
} from '@/src/data/espn'
import type {
  Article,
  CatalogTeam,
  Digest,
  DigestSection,
  GameDetail,
  PlayerCard,
  PlayerHit,
  SlateGame,
  StandingRow,
  StatChip,
} from '@/src/data/types'

export async function getSlate(force = false) {
  return cached('slate', features.ttl.scoreboardMs, fetchSlate, force)
}

export async function getNews(force = false): Promise<{ data: Article[]; at: number; stale: boolean }> {
  return cached('news', features.ttl.newsMs, fetchNews, force)
}

export async function getStandings(force = false) {
  return cached('standings', features.ttl.standingsMs, fetchStandings, force)
}

export async function getCatalog(force = false): Promise<{ data: CatalogTeam[]; at: number; stale: boolean }> {
  let api: CatalogTeam[] = []
  let stale = false
  let at = Date.now()
  try {
    const loaded = await cached('teams', features.ttl.teamsMs, fetchTeamList, force)
    api = loaded.data
    stale = loaded.stale
    at = loaded.at
  } catch {
    // Built-in club list, not a saved feed. Don't call that a failed refresh.
    stale = false
  }
  const byAbbr = new Map(api.map((team) => [team.abbr, team]))
  const data = nflTeams.map((team) => {
    const live = byAbbr.get(team.abbr)
    const colors = paint(team.abbr, live?.color || team.color, live?.alt || team.alt)
    return {
      id: live?.id || team.id,
      abbr: team.abbr,
      name: live?.name || team.name,
      city: team.city,
      conference: team.conference,
      division: `${team.conference} ${team.division}`,
      color: colors.color,
      alt: colors.alt,
      logo: officialLogo(team.abbr),
    }
  })
  return { data, at, stale }
}

export async function getLeague(force = false): Promise<{ data: CatalogTeam[]; at: number; stale: boolean }> {
  const [catalog, standings] = await Promise.all([getCatalog(force), getStandings(force).catch(() => null)])
  const byId = new Map((standings?.data ?? []).map((row) => [row.teamId, row]))
  return {
    data: catalog.data.map((team) => ({ ...team, record: byId.get(team.id)?.record })),
    at: Math.min(catalog.at, standings?.at ?? catalog.at),
    stale: catalog.stale,
  }
}

export async function getGameDetail(id: string, force = false): Promise<GameDetail> {
  const [summary, slate] = await Promise.all([
    cached(`game:${id}`, features.ttl.gameMs, () => fetchSummary(id), force),
    getSlate(force).catch(() => null),
  ])
  const mapped = mapSummary(summary.data, id)
  const fromSlate = slate?.data.find((game) => game.id === id)
  if (fromSlate) {
    mapped.game = {
      ...mapped.game,
      state: fromSlate.state,
      detail: fromSlate.detail || mapped.game.detail,
      possessionId: fromSlate.possessionId ?? mapped.game.possessionId,
      downLine: fromSlate.downLine ?? mapped.game.downLine,
      redZone: fromSlate.redZone || mapped.game.redZone,
      shortName: fromSlate.shortName || mapped.game.shortName,
      broadcast: mapped.game.broadcast || fromSlate.broadcast,
      home: {
        ...mapped.game.home,
        score: fromSlate.state === 'pre' ? '' : fromSlate.home.score || mapped.game.home.score,
        record: mapped.game.home.record || fromSlate.home.record,
        logo: mapped.game.home.logo || fromSlate.home.logo,
      },
      away: {
        ...mapped.game.away,
        score: fromSlate.state === 'pre' ? '' : fromSlate.away.score || mapped.game.away.score,
        record: mapped.game.away.record || fromSlate.away.record,
        logo: mapped.game.away.logo || fromSlate.away.logo,
      },
    }
  }
  return { ...mapped, updatedAt: summary.at, stale: summary.stale }
}

function chips(specs: StatSpec[], bag: Record<string, string>): StatChip[] {
  return specs.flatMap((spec) => {
    const value = bag[spec.source]
    if (!value) return []
    return [{ label: spec.label, value, glossary: spec.glossary }]
  })
}

function sectionsFrom(bag: Record<string, string>): DigestSection[] {
  return seasonSections.flatMap((section) => {
    let main = chips(section.main, bag)
    let more = chips(section.more, bag)
    if (!main.length && more.length) {
      main = more.slice(0, 4)
      more = more.slice(4)
    }
    if (!main.length) return []
    return [{ id: section.id, title: section.title, blurb: section.blurb, main, more }]
  })
}

export async function getDigest(teamId: string, force = false): Promise<Digest> {
  const [profile, schedule, injuries, season, notes, standings, catalog] = await Promise.all([
    cached(`team:${teamId}`, features.ttl.teamMs, () => fetchTeamRaw(teamId), force),
    cached(`sched:${teamId}`, features.ttl.teamMs, () => fetchSchedule(teamId), force).catch(() => ({
      data: [] as SlateGame[],
      at: Date.now(),
      stale: true,
    })),
    cached(`inj:${teamId}`, features.ttl.teamMs, () => fetchRosterInjuries(teamId), force).catch(() => ({
      data: [],
      at: Date.now(),
      stale: true,
    })),
    cached(`stats:${teamId}`, features.ttl.teamMs, () => fetchSeasonBag(teamId), force).catch(() => ({
      data: {} as Record<string, string>,
      at: Date.now(),
      stale: true,
    })),
    cached(`notes:${teamId}`, features.ttl.newsMs, () => {
      const known = nflTeams.find((team) => team.id === teamId)
      return known ? fetchTeamNotes(known.abbr, known.name) : Promise.resolve([])
    }, force).catch(() => ({
      data: [] as { headline: string; detail: string }[],
      at: Date.now(),
      stale: true,
    })),
    getStandings(force).catch(() => ({ data: [] as StandingRow[], at: Date.now(), stale: true })),
    getCatalog(force).catch(() => ({ data: [] as CatalogTeam[], at: Date.now(), stale: true })),
  ])
  const info = profileFromTeam(profile.data)
  const bag = { ...season.data, ...info.bag }
  const standing = standings.data.find((row) => row.teamId === teamId)
  const record = bag['record.summary'] || standing?.record || ''
  const place = bag['record.standing'] || ''
  const team = catalog.data.find((row) => row.id === teamId || row.abbr === info.abbr)
  const colors = paint(info.abbr || team?.abbr || '', team?.color, team?.alt)
  const dated = [...schedule.data].filter((game) => game.date).sort((a, b) => a.date.localeCompare(b.date))
  const last = [...dated].reverse().find((game) => game.state === 'post')
  const next = dated.find((game) => game.state === 'pre' || game.state === 'in')
  let leaders: Digest['leaders'] = []
  if (last) {
    try {
      const detail = await getGameDetail(last.id, force)
      leaders = detail.leaders.filter((leader) => !leader.teamId || leader.teamId === teamId).slice(0, 3)
    } catch {
      leaders = []
    }
  }
  const mates = team
    ? catalog.data
        .filter((row) => row.division === team.division)
        .map((row) => {
          const rowStanding = standings.data.find((item) => item.teamId === row.id)
          return {
            id: row.id,
            abbr: row.abbr,
            name: row.name,
            record: rowStanding?.record || '—',
            wins: rowStanding?.wins ?? -1,
            yours: row.id === teamId,
          }
        })
        .sort((a, b) => b.wins - a.wins)
    : []
  const perGameFor = bag['record.avgPointsFor']
  const perGameAgainst = bag['record.avgPointsAgainst']
  return {
    teamId,
    abbr: info.abbr || team?.abbr || '',
    name: info.name || team?.name || 'Team',
    shortName: info.shortName || team?.abbr || 'Team',
    color: colors.color,
    alt: colors.alt,
    logo: officialLogo(info.abbr || team?.abbr || ''),
    record,
    standing: place,
    streak: standing?.streak || '',
    pointsFor: perGameFor || standing?.pointsFor || '—',
    pointsAgainst: perGameAgainst || standing?.pointsAgainst || '—',
    pointsForLabel: perGameFor ? 'PF/G' : 'PF',
    pointsAgainstLabel: perGameAgainst ? 'PA/G' : 'PA',
    tldr: teamTldr(info.shortName || info.name || 'This team', record, place),
    next,
    last,
    sections: sectionsFrom(bag),
    leaders,
    injuries: injuries.data,
    notes: notes.data,
    division: mates,
    updatedAt: profile.at,
    stale: profile.stale || schedule.stale || season.stale,
  }
}

type IndexedPlayer = PlayerHit & { active: boolean }

async function buildPlayerIndex(): Promise<IndexedPlayer[]> {
  const found: IndexedPlayer[] = []
  const size = 4
  for (let start = 0; start < nflTeams.length; start += size) {
    const slice = nflTeams.slice(start, start + size)
    const rosters = await Promise.all(slice.map((team) => fetchRosterPlayers(team.id).catch(() => [])))
    slice.forEach((team, index) => {
      for (const player of rosters[index]) {
        found.push({
          id: player.id,
          name: player.name,
          teamName: team.name,
          position: player.position,
          active: player.active,
        })
      }
    })
  }
  return found
}

/** A one-word search stays on the name and position, so "Chiefs" does not dump that roster. A second word can be the team. */
function scorePlayer(text: string, player: IndexedPlayer): number {
  const asNamed = fuzzyScore(text, `${player.name} ${player.position ?? ''}`.trim())
  if (!text.includes(' ')) return asNamed
  return Math.max(asNamed, fuzzyScore(text, `${player.name} ${player.position ?? ''} ${player.teamName}`))
}

export async function searchPlayers(query: string): Promise<PlayerHit[]> {
  const text = query.trim()
  if (text.length < 2) return []
  try {
    const index = await cached('player-index', features.ttl.playerIndexMs, buildPlayerIndex)
    const ranked = index.data
      .map((player) => ({
        player,
        score: scorePlayer(text, player),
      }))
      .filter((hit) => hit.score >= fuzzyCutoff)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
    if (ranked.length) return ranked.map((hit) => hit.player)
  } catch {
    /* The roster index can fail. The name search below still works for an exact spelling. */
  }
  const exact = await cached(`search:${text.toLowerCase()}`, features.ttl.searchMs, () => fetchPlayerHits(text))
  return exact.data
}

export async function loadPlayer(hit: PlayerHit): Promise<PlayerCard> {
  const result = await cached(`player:v2:${hit.id}`, features.ttl.playerMs, () => fetchPlayerCard(hit.id, hit))
  const catalog = await getCatalog().catch(() => null)
  const teams = catalog?.data ?? []
  const byId = (id?: string) => (id ? teams.find((team) => team.id === id) : undefined)
  const current = byId(result.data.teamId)
  const fromHint = teams.find(
    (team) => hit.teamName && (hit.teamName.includes(team.name) || (team.city && hit.teamName.includes(team.city))),
  )
  const clubs = (result.data.clubs ?? []).flatMap((club) => {
    const team = byId(club.teamId)
    const name = team?.name || club.name
    const abbr = team?.abbr || club.abbr
    if (!name && !abbr) return []
    return [{ ...club, name: name || abbr, abbr }]
  })
  let draft = result.data.draft
  const draftedBy = byId(result.data.draftTeamId)
  if (draft && draftedBy && !draft.includes(draftedBy.name)) draft = `${draft}, ${draftedBy.name}`
  let injury = result.data.injury
  let injuryNote = result.data.injuryNote
  try {
    const report = await cached('injury-report', features.ttl.newsMs, fetchInjuryReport)
    const listed = report.data[hit.id]
    if (listed) {
      injury = listed.line
      injuryNote = listed.note || undefined
    }
  } catch {
    /* The card still opens. The report is extra. */
  }
  const { teamId: _teamId, draftTeamId: _draftTeamId, ...card } = result.data
  return {
    ...card,
    teamAbbr: current?.abbr || fromHint?.abbr || card.teamAbbr,
    teamName: current?.name || fromHint?.name || card.teamName,
    ...(draft ? { draft } : {}),
    clubs,
    ...(injury ? { injury } : {}),
    ...(injuryNote ? { injuryNote } : {}),
    headshot: card.headshot || hit.headshot,
  }
}

export { describeGame }
