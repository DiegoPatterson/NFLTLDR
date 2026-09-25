import { endpoints } from '@/src/config/endpoints'
import { officialLogo } from '@/src/config/logos'
import { newsRules } from '@/src/config/newsRules'
import {
  liveCompare,
  previewCompare,
  seasonSections,
  type StatSpec,
} from '@/src/config/statCatalog'
import { paint } from '@/src/logic/color'
import { clockFromDetail } from '@/src/logic/liveClock'
import {
  clubSpans,
  clubsFromSpans,
  collegeLookup,
  draftBits,
  experienceLabel,
  injuriesByPlayer,
  playerNotes,
  wireNote,
  type InjuryLine,
} from '@/src/logic/playerFacts'
import { scoreTldr } from '@/src/logic/tldr'
import { arr, isRecord, parseStatNumber, str } from '@/src/data/json'
import type {
  Article,
  CatalogTeam,
  CompareRow,
  GameDetail,
  GameState,
  Injury,
  Leader,
  PlayerCard,
  PlayerHit,
  Side,
  SlateGame,
  StandingRow,
} from '@/src/data/types'

const HEADERS = {
  Accept: 'application/json',
  Referer: 'https://www.espn.com/',
}

async function getJson(url: string, attempt = 0): Promise<unknown> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 15000)
  try {
    const response = await fetch(url, { headers: HEADERS, signal: ctrl.signal })
    if (!response.ok) throw new Error(`Feed answered ${response.status}`)
    return await response.json()
  } catch (error) {
    if (attempt < 1) return getJson(url, attempt + 1)
    throw error
  } finally {
    clearTimeout(timer)
  }
}

function site(path: string): string {
  return `${endpoints.site}${path}`
}

function stateOf(value: unknown): GameState {
  const name = str(value)
  if (name === 'in') return 'in'
  if (name === 'post') return 'post'
  return 'pre'
}

function recordSummary(value: unknown): string | undefined {
  for (const row of arr(value)) {
    if (!isRecord(row)) continue
    const type = str(row.type || row.name)
    if (type === 'total' || type === 'overall' || type === 'Total') {
      const summary = str(row.summary)
      if (summary) return summary
    }
  }
  const first = arr(value).find(isRecord)
  return first ? str(first.summary) || undefined : undefined
}

function mapSide(raw: unknown, fallbackScore = ''): Side | null {
  if (!isRecord(raw)) return null
  const team = isRecord(raw.team) ? raw.team : raw
  const id = str(team.id)
  const abbr = str(team.abbreviation)
  if (!id || !abbr) return null
  let score = fallbackScore
  if (typeof raw.score === 'string' || typeof raw.score === 'number') score = str(raw.score)
  else if (isRecord(raw.score)) score = str(raw.score.displayValue || raw.score.value)
  const colors = paint(abbr, str(team.color), str(team.alternateColor))
  return {
    id,
    abbr,
    name: str(team.displayName || team.name, abbr),
    shortName: str(team.shortDisplayName || team.name, abbr),
    score,
    record: recordSummary(raw.records),
    color: colors.color,
    logo: officialLogo(abbr),
    homeAway: str(raw.homeAway) === 'home' ? 'home' : 'away',
  }
}

function situationOf(raw: unknown): { possessionId?: string; downLine?: string; redZone?: boolean } {
  if (!isRecord(raw)) return {}
  const possession = isRecord(raw.possession) ? str(raw.possession.id) : str(raw.possession)
  const text = str(raw.shortDownDistanceText || raw.downDistanceText || raw.possessionText)
  let downLine = text
  if (!downLine && raw.down && raw.distance) {
    const down = Number(raw.down)
    const ord = ['', '1st', '2nd', '3rd', '4th'][down] || `${down}th`
    downLine = `${ord} & ${str(raw.distance)}`
  }
  return {
    possessionId: possession || undefined,
    downLine: downLine || undefined,
    redZone: raw.isRedZone === true,
  }
}

export function mapEvent(raw: unknown): SlateGame | null {
  if (!isRecord(raw)) return null
  const competition = arr(raw.competitions).find(isRecord) ?? raw
  if (!isRecord(competition)) return null
  const status = isRecord(competition.status) ? competition.status : isRecord(raw.status) ? raw.status : {}
  const type = isRecord(status.type) ? status.type : {}
  const state = stateOf(type.state)
  const sides = arr(competition.competitors)
    .map((side) => mapSide(side))
    .filter((side): side is Side => side != null)
  const home = sides.find((side) => side.homeAway === 'home') ?? sides[1]
  const away = sides.find((side) => side.homeAway === 'away') ?? sides[0]
  if (!home || !away) return null
  if (state === 'pre') {
    home.score = ''
    away.score = ''
  }
  const outlets = broadcastOutlets(competition)
  const venue = isRecord(competition.venue) ? str(competition.venue.fullName) : ''
  const situation = situationOf(competition.situation)
  const detail = str(type.shortDetail || type.detail)
  const clock = clockFromDetail(detail, str(status.displayClock))
  const running = isRecord(competition.situation) && typeof competition.situation.isClockRunning === 'boolean'
    ? competition.situation.isClockRunning
    : undefined
  return {
    id: str(raw.id || competition.id),
    shortName: str(raw.shortName, `${away.abbr} @ ${home.abbr}`),
    date: str(raw.date || competition.date),
    state,
    detail,
    ...(clock ? { clock } : {}),
    ...(running === undefined ? {} : { clockRunning: running }),
    week: isRecord(raw.week) ? str(raw.week.text || raw.week.number) || undefined : undefined,
    broadcast: outlets.primary,
    ...(outlets.outlets.length ? { outlets: outlets.outlets } : {}),
    venue: venue || undefined,
    home,
    away,
    ...situation,
  }
}

type Outlet = { name: string; label: string; kind: string; market: string }

function fieldText(value: unknown, keys: string[]): string {
  if (typeof value === 'string') return value.trim()
  if (!isRecord(value)) return ''
  for (const key of keys) {
    const text = str(value[key])
    if (text) return text
  }
  return ''
}

function outletLabel(name: string, kind: string, market: string): string {
  const extra = market || (/^tv$/i.test(kind) ? '' : kind)
  return extra ? `${name} · ${extra}` : name
}

/** TV and streaming outlets. National television is the main listing. Local call letters are not in this feed. */
function broadcastOutlets(competition: Record<string, unknown>): { primary?: string; outlets: { name: string; label: string }[] } {
  const found: Outlet[] = []
  for (const item of [...arr(competition.broadcasts), ...arr(competition.geoBroadcasts)]) {
    if (!isRecord(item)) continue
    const kind = fieldText(item.type, ['shortName', 'name'])
    const market = fieldText(item.market, ['type', 'name'])
    const media = isRecord(item.media) ? str(item.media.shortName || item.media.name) : ''
    const names = Array.isArray(item.names) ? item.names.map((name) => str(name)) : [str(item.names)]
    for (const name of [...names, media]) {
      const clean = name.trim()
      if (!clean || found.some((outlet) => outlet.name.toLowerCase() === clean.toLowerCase())) continue
      found.push({ name: clean, kind, market, label: outletLabel(clean, kind, market) })
    }
  }
  if (competition.onWatchESPN === true && !found.some((outlet) => outlet.name.toLowerCase() === 'watch espn')) {
    found.push({ name: 'Watch ESPN', kind: 'Streaming', market: '', label: 'Watch ESPN' })
  }
  const nationalTv = found.find((outlet) => /^tv$/i.test(outlet.kind) && /national/i.test(outlet.market))
  const anyTv = found.find((outlet) => /^tv$/i.test(outlet.kind))
  const primary = nationalTv ?? anyTv ?? found[0]
  return {
    primary: primary?.label,
    outlets: found.map((outlet) => ({ name: outlet.name, label: outlet.label })),
  }
}

function gamesFromScoreboard(json: unknown): SlateGame[] {
  const root = isRecord(json) && isRecord(json.content) && json.content.sbData ? json.content.sbData : json
  const events = isRecord(root) ? root.events : undefined
  return arr(events).map(mapEvent).filter((game): game is SlateGame => game != null)
}

/** Playoff weeks only. An empty list means the postseason has not started. */
export async function fetchPostseason(): Promise<SlateGame[]> {
  const games: SlateGame[] = []
  const seen = new Set<string>()
  for (const week of [1, 2, 3, 4, 5]) {
    const json = await getJson(
      site(`/apis/site/v2/sports/${endpoints.sport}/${endpoints.league}/scoreboard?seasontype=3&week=${week}`),
    ).catch(() => null)
    if (!isRecord(json)) continue
    const season = isRecord(json.season) ? json.season : {}
    if (str(season.type) !== '3') continue
    for (const game of gamesFromScoreboard(json)) {
      if (!game.id || seen.has(game.id)) continue
      seen.add(game.id)
      games.push(game)
    }
  }
  return games
}

export async function fetchSlate(): Promise<SlateGame[]> {
  try {
    const json = await getJson(site(`/apis/site/v2/sports/${endpoints.sport}/${endpoints.league}/scoreboard`))
    const games = gamesFromScoreboard(json)
    if (games.length) return games
  } catch {
    /* The site feed misses. The CDN copy is the backup. */
  }
  const cdn = await getJson(endpoints.cdnScoreboard)
  return gamesFromScoreboard(cdn)
}

export async function fetchTeamList(): Promise<CatalogTeam[]> {
  const json = await getJson(site(`/apis/site/v2/sports/${endpoints.sport}/${endpoints.league}/teams?limit=32`))
  const sports = arr(isRecord(json) ? json.sports : [])
  const leagues = arr(isRecord(sports[0]) ? (sports[0] as Record<string, unknown>).leagues : [])
  const teams = arr(isRecord(leagues[0]) ? (leagues[0] as Record<string, unknown>).teams : [])
  const out: CatalogTeam[] = []
  for (const row of teams) {
    const team = isRecord(row) && isRecord(row.team) ? row.team : row
    if (!isRecord(team)) continue
    const abbr = str(team.abbreviation)
    if (!abbr) continue
    const colors = paint(abbr, str(team.color), str(team.alternateColor))
    out.push({
      id: str(team.id),
      abbr,
      name: str(team.displayName, abbr),
      city: str(team.location),
      conference: 'NFC',
      division: 'Other',
      color: colors.color,
      alt: colors.alt,
      logo: officialLogo(abbr),
    })
  }
  return out
}

function statValue(stats: unknown[], name: string): string {
  for (const stat of stats) {
    if (!isRecord(stat)) continue
    if (str(stat.name) === name || str(stat.abbreviation) === name) return str(stat.displayValue)
  }
  return ''
}

export async function fetchStandings(): Promise<StandingRow[]> {
  const json = await getJson(site(`/apis/v2/sports/${endpoints.sport}/${endpoints.league}/standings`))
  const rows: StandingRow[] = []
  for (const conf of arr(isRecord(json) ? json.children : [])) {
    if (!isRecord(conf) || !isRecord(conf.standings)) continue
    for (const entry of arr(conf.standings.entries)) {
      if (!isRecord(entry) || !isRecord(entry.team)) continue
      const stats = arr(entry.stats)
      const wins = Number(statValue(stats, 'wins') || 0)
      rows.push({
        teamId: str(entry.team.id),
        record: statValue(stats, 'overall') || `${statValue(stats, 'wins')}-${statValue(stats, 'losses')}`,
        wins: Number.isFinite(wins) ? wins : 0,
        streak: statValue(stats, 'streak'),
        pointsFor: statValue(stats, 'pointsFor'),
        pointsAgainst: statValue(stats, 'pointsAgainst'),
        seed: (() => {
          const seed = Number(statValue(stats, 'playoffSeed'))
          return Number.isFinite(seed) && seed > 0 ? seed : undefined
        })(),
      })
    }
  }
  return rows
}

const bigPattern = new RegExp(newsRules.bigPattern, 'i')
const bettingPattern = new RegExp(newsRules.bettingPattern, 'i')
const voicePattern = new RegExp(newsRules.voicePattern, 'i')

function readArticles(json: unknown): Article[] {
  const seen = new Set<string>()
  return arr(isRecord(json) ? json.articles : []).flatMap((article, index) => {
    if (!isRecord(article)) return []
    const headline = str(article.headline)
    if (!headline) return []
    const description = str(article.description)
    const categories = arr(article.categories)
      .map((category) => (isRecord(category) ? str(category.description) : ''))
      .filter(Boolean)
      .join(' ')
    const blob = `${headline} ${description} ${categories}`
    if (bettingPattern.test(blob)) return []
    let id = str(article.id, headline)
    if (seen.has(id)) id = `${id}-${index}`
    seen.add(id)
    return [
      {
        id,
        headline,
        description,
        big: bigPattern.test(headline),
        categories,
      },
    ]
  })
}

export async function fetchNews(): Promise<Article[]> {
  const json = await getJson(site(`/apis/site/v2/sports/${endpoints.sport}/${endpoints.league}/news?limit=15`))
  return readArticles(json)
}

export async function fetchTeamNotes(
  abbr: string,
  name: string,
): Promise<{ headline: string; detail: string }[]> {
  const json = await getJson(
    site(`/apis/site/v2/sports/${endpoints.sport}/${endpoints.league}/news?team=${encodeURIComponent(abbr.toLowerCase())}&limit=12`),
  )
  const nameHit = name.toLowerCase()
  const rows = readArticles(json).filter((article) => {
    const blob = `${article.headline} ${article.description} ${article.categories ?? ''}`.toLowerCase()
    return blob.includes(nameHit) || (article.categories ?? '').toLowerCase().includes(nameHit)
  })
  const voiced = rows.filter((article) => voicePattern.test(`${article.headline} ${article.description}`))
  const chosen = (voiced.length ? voiced : rows.slice(0, 1)).slice(0, newsRules.maxSideline)
  return chosen.map((article) => ({ headline: article.headline, detail: article.description }))
}

export async function fetchTeamRaw(id: string): Promise<unknown> {
  return getJson(site(`/apis/site/v2/sports/${endpoints.sport}/${endpoints.league}/teams/${id}`))
}

export async function fetchSchedule(id: string): Promise<{ games: SlateGame[]; byeWeek?: number }> {
  const json = await getJson(site(`/apis/site/v2/sports/${endpoints.sport}/${endpoints.league}/teams/${id}/schedule`))
  const root = isRecord(json) ? json : {}
  const bye = Number(root.byeWeek)
  return {
    games: arr(root.events).map(mapEvent).filter((game): game is SlateGame => game != null),
    byeWeek: Number.isFinite(bye) && bye > 0 ? bye : undefined,
  }
}

export function injuriesFromRoster(json: unknown, teamAbbr?: string): Injury[] {
  const root = isRecord(json) ? json : {}
  const people: Injury[] = []
  for (const group of arr(root.athletes)) {
    if (!isRecord(group)) continue
    for (const player of arr(group.items)) {
      if (!isRecord(player)) continue
      const injury = arr(player.injuries).find(isRecord)
      if (!injury) continue
      const status = str(injury.status)
      if (!status || /^(active|healthy|probable)$/i.test(status)) continue
      const position = isRecord(player.position) ? str(player.position.abbreviation) : ''
      people.push({
        name: str(player.displayName || player.fullName),
        position,
        status,
        teamAbbr,
      })
    }
  }
  return sortInjuries(people)
}

export type RosterIndexPlayer = {
  id: string
  name: string
  position: string
  active: boolean
  /**
   * Lower means the depth chart lists him sooner. Starters come before backups.
   * Absent on the search index, which does not load the depth chart.
   */
  usage?: number
}

export function playersFromRoster(json: unknown): RosterIndexPlayer[] {
  const root = isRecord(json) ? json : {}
  const people: RosterIndexPlayer[] = []
  for (const group of arr(root.athletes)) {
    if (!isRecord(group)) continue
    for (const player of arr(group.items)) {
      if (!isRecord(player)) continue
      const id = str(player.id) || (str(player.uid).split('~a:')[1] ?? '')
      const name = str(player.displayName || player.fullName)
      if (!id || !name) continue
      const status = isRecord(player.status) ? str(player.status.type || player.status.name) : ''
      people.push({
        id,
        name,
        position: isRecord(player.position) ? str(player.position.abbreviation) : '',
        active: /^active$/i.test(status),
      })
    }
  }
  return people
}

export async function fetchRosterPlayers(id: string): Promise<RosterIndexPlayer[]> {
  const json = await getJson(site(`/apis/site/v2/sports/${endpoints.sport}/${endpoints.league}/teams/${id}/roster`))
  return playersFromRoster(json)
}

/** Depth-chart order. The first name at a spot is the one the club lists to play there. */
export function usageFromDepth(json: unknown): Record<string, number> {
  const root = isRecord(json) ? json : {}
  const ranks: Record<string, number> = {}
  for (const chart of arr(root.depthchart)) {
    if (!isRecord(chart)) continue
    const special = /special/i.test(str(chart.name))
    const base = special ? 5000 : 0
    const positions = isRecord(chart.positions) ? chart.positions : {}
    let slot = 0
    for (const key of Object.keys(positions)) {
      const entry = positions[key]
      if (isRecord(entry)) {
        arr(entry.athletes).forEach((athlete, depth) => {
          if (!isRecord(athlete)) return
          const id = str(athlete.id)
          if (!id) return
          const score = base + depth * 100 + slot
          const prev = ranks[id]
          if (prev == null || score < prev) ranks[id] = score
        })
      }
      slot += 1
    }
  }
  return ranks
}

export async function fetchDepthRanks(teamId: string): Promise<Record<string, number>> {
  const json = await getJson(
    site(`/apis/site/v2/sports/${endpoints.sport}/${endpoints.league}/teams/${teamId}/depthcharts`),
  )
  return usageFromDepth(json)
}

export async function fetchRosterInjuries(id: string, teamAbbr?: string): Promise<Injury[]> {
  const json = await getJson(site(`/apis/site/v2/sports/${endpoints.sport}/${endpoints.league}/teams/${id}/roster`))
  return injuriesFromRoster(json, teamAbbr)
}

export async function fetchSeasonBag(id: string): Promise<Record<string, string>> {
  const json = await getJson(
    `${endpoints.core}/v2/sports/${endpoints.sport}/leagues/${endpoints.league}/seasons/${endpoints.season}/types/2/teams/${id}/statistics`,
  )
  const bag: Record<string, string> = {}
  const splits = isRecord(json) && isRecord(json.splits) ? json.splits : {}
  for (const category of arr(splits.categories)) {
    if (!isRecord(category)) continue
    const name = str(category.name)
    for (const stat of arr(category.stats)) {
      if (!isRecord(stat)) continue
      const key = `${name}.${str(stat.name)}`
      const value = str(stat.displayValue)
      if (key && value) bag[key] = value
    }
  }
  return bag
}

function recordBag(team: Record<string, unknown>): Record<string, string> {
  const bag: Record<string, string> = {}
  const record = isRecord(team.record) ? team.record : {}
  for (const item of arr(record.items)) {
    if (!isRecord(item) || str(item.type) !== 'total') continue
    bag['record.summary'] = str(item.summary)
    for (const stat of arr(item.stats)) {
      if (!isRecord(stat)) continue
      const name = str(stat.name)
      const value = stat.value
      if (!name || (typeof value !== 'number' && typeof value !== 'string')) continue
      bag[`record.${name}`] = typeof value === 'number' ? trimNumber(value) : str(value)
    }
  }
  if (str(team.standingSummary)) bag['record.standing'] = str(team.standingSummary)
  return bag
}

function trimNumber(value: number): string {
  if (Number.isInteger(value)) return String(value)
  return String(Math.round(value * 10) / 10)
}

export function profileFromTeam(json: unknown): { bag: Record<string, string>; abbr: string; name: string; shortName: string; id: string } {
  const root = isRecord(json) ? json : {}
  const team = isRecord(root.team) ? root.team : root
  return {
    id: str(team.id),
    abbr: str(team.abbreviation),
    name: str(team.displayName),
    shortName: str(team.shortDisplayName || team.name),
    bag: recordBag(team),
  }
}

function specRows(specs: StatSpec[], away: Record<string, string>, home: Record<string, string>): CompareRow[] {
  const rows: CompareRow[] = []
  for (const spec of specs) {
    const a = away[spec.source]
    const h = home[spec.source]
    if (!a && !h) continue
    rows.push({ label: spec.label, glossary: spec.glossary, away: a || '—', home: h || '—' })
  }
  return rows
}

function statBag(block: unknown): Record<string, string> {
  const bag: Record<string, string> = {}
  if (!isRecord(block)) return bag
  for (const stat of arr(block.statistics)) {
    if (!isRecord(stat)) continue
    const name = str(stat.name)
    const value = str(stat.displayValue)
    if (name && value) bag[name] = value
  }
  return bag
}

export function leadersFrom(json: unknown, teamId?: string): Leader[] {
  const root = isRecord(json) ? json : {}
  const found: Leader[] = []
  const walkCategory = (category: Record<string, unknown>, fallbackTeam: string) => {
    const label = str(category.shortDisplayName || category.displayName || category.name)
    for (const person of arr(category.leaders)) {
      if (!isRecord(person)) continue
      const athlete = isRecord(person.athlete) ? person.athlete : {}
      const personTeam = isRecord(person.team) ? str(person.team.id) : fallbackTeam
      if (teamId && personTeam && personTeam !== teamId) continue
      const name = str(athlete.displayName || athlete.fullName || athlete.shortName)
      const line = str(person.displayValue)
      if (!name || !line) continue
      found.push({ category: label, name, line, teamId: personTeam || undefined })
    }
  }
  for (const bucket of arr(root.leaders)) {
    if (!isRecord(bucket)) continue
    const bucketTeam = isRecord(bucket.team) ? str(bucket.team.id) : ''
    const inner = arr(bucket.leaders)
    const first = inner.find(isRecord)
    if (first && (isRecord(first.athlete) || typeof first.displayValue === 'string')) {
      walkCategory(bucket, bucketTeam)
    } else {
      for (const category of inner) {
        if (isRecord(category)) walkCategory(category, bucketTeam)
      }
    }
  }
  return found.slice(0, 6)
}

function injuriesFromSummary(json: unknown): Injury[] {
  const root = isRecord(json) ? json : {}
  const people: Injury[] = []
  for (const group of arr(root.injuries)) {
    if (!isRecord(group)) continue
    const team = isRecord(group.team) ? group.team : {}
    const teamAbbr = str(team.abbreviation)
    for (const injury of arr(group.injuries)) {
      if (!isRecord(injury)) continue
      const athlete = isRecord(injury.athlete) ? injury.athlete : {}
      const position = isRecord(athlete.position) ? str(athlete.position.abbreviation) : ''
      const status = str(injury.status)
      if (!status) continue
      people.push({
        name: str(athlete.displayName || athlete.fullName),
        position,
        status,
        teamAbbr: teamAbbr || undefined,
      })
    }
  }
  return sortInjuries(people)
}

const INJURY_RANK: Record<string, number> = { out: 0, doubtful: 1, questionable: 2, suspension: 3 }

export function sortInjuries(people: Injury[]): Injury[] {
  return [...people].sort((a, b) => (INJURY_RANK[a.status.toLowerCase()] ?? 9) - (INJURY_RANK[b.status.toLowerCase()] ?? 9))
}

export function mapSummary(json: unknown, fallbackId: string): Omit<GameDetail, 'updatedAt' | 'stale'> {
  const root = isRecord(json) ? json : {}
  const header = isRecord(root.header) ? root.header : {}
  const event = mapEvent({ ...header, id: str(header.id, fallbackId), competitions: header.competitions })
  const game =
    event ??
    ({
      id: fallbackId,
      shortName: 'Game',
      date: '',
      state: 'pre',
      detail: '',
      home: emptySide('home'),
      away: emptySide('away'),
    } satisfies SlateGame)
  const box = isRecord(root.boxscore) ? root.boxscore : {}
  const blocks = arr(box.teams).filter(isRecord)
  const awayBlock = blocks.find((block) => str(block.homeAway) === 'away') ?? blocks[0]
  const homeBlock = blocks.find((block) => str(block.homeAway) === 'home') ?? blocks[1]
  const pace = game.state === 'pre'
  const spec = pace ? previewCompare : liveCompare
  const awayBag = statBag(awayBlock)
  const homeBag = statBag(homeBlock)
  const rows = specRows(spec.main, awayBag, homeBag)
  const more = specRows(spec.more, awayBag, homeBag)
  return {
    game,
    pace,
    rows,
    more,
    leaders: leadersFrom(root),
    injuries: injuriesFromSummary(root),
  }
}

function emptySide(homeAway: 'home' | 'away'): Side {
  return { id: '', abbr: '—', name: '—', shortName: '—', score: '', color: '#E2C16B', homeAway }
}

export function yardsOf(rows: CompareRow[], side: 'away' | 'home'): string | undefined {
  return rows.find((row) => row.label === 'Yards')?.[side]
}

export function turnoversOf(rows: CompareRow[], side: 'away' | 'home'): string | undefined {
  return rows.find((row) => row.label === 'Turnovers')?.[side]
}

export function describeGame(detail: Omit<GameDetail, 'updatedAt' | 'stale'>): string {
  return scoreTldr({
    state: detail.game.state,
    awayName: detail.game.away.shortName,
    homeName: detail.game.home.shortName,
    awayScore: detail.game.away.score,
    homeScore: detail.game.home.score,
    awayYards: yardsOf(detail.rows, 'away'),
    homeYards: yardsOf(detail.rows, 'home'),
    awayTurnovers: turnoversOf(detail.rows, 'away'),
    homeTurnovers: turnoversOf(detail.rows, 'home'),
  })
}

export async function fetchSummary(id: string): Promise<unknown> {
  return getJson(site(`/apis/site/v2/sports/${endpoints.sport}/${endpoints.league}/summary?event=${id}`))
}

export function seasonSpecs() {
  return seasonSections
}

export async function fetchPlayerHits(query: string): Promise<PlayerHit[]> {
  const json = await getJson(
    site(`/apis/search/v2?query=${encodeURIComponent(query)}&limit=8&type=player`),
  )
  const hits: PlayerHit[] = []
  const seen = new Set<string>()
  for (const group of arr(isRecord(json) ? json.results : [])) {
    if (!isRecord(group)) continue
    for (const item of arr(group.contents)) {
      if (!isRecord(item) || str(item.type) !== 'player') continue
      const uid = str(item.uid)
      if (!uid.includes(endpoints.nflLeagueUid)) continue
      const id = uid.split('~a:')[1] || ''
      if (!id || seen.has(id)) continue
      seen.add(id)
      const image = isRecord(item.image) ? str(item.image.default) : ''
      hits.push({
        id,
        name: str(item.displayName),
        teamName: str(item.subtitle),
        headshot: image || undefined,
      })
    }
  }
  return hits
}

export async function fetchInjuryReport(): Promise<Record<string, InjuryLine>> {
  const json = await getJson(site(`/apis/site/v2/sports/${endpoints.sport}/${endpoints.league}/injuries`))
  return injuriesByPlayer(json)
}

export async function fetchPlayerCard(id: string, hint?: PlayerHit): Promise<PlayerCardDraft> {
  const [athlete, overview, seasonStats] = await Promise.all([
    getJson(`${endpoints.core}/v2/sports/${endpoints.sport}/leagues/${endpoints.league}/athletes/${id}?lang=en`).catch(
      () => null,
    ),
    getJson(site(`/apis/common/v3/sports/${endpoints.sport}/${endpoints.league}/athletes/${id}/overview`)).catch(
      () => null,
    ),
    getJson(site(`/apis/common/v3/sports/${endpoints.sport}/${endpoints.league}/athletes/${id}/stats`)).catch(
      () => null,
    ),
  ])
  const body = isRecord(athlete) ? athlete : {}
  const position = isRecord(body.position) ? str(body.position.abbreviation) : ''
  const statusName = isRecord(body.status) ? str(body.status.name) : ''
  const statusType = isRecord(body.status) ? str(body.status.type || body.status.name) : ''
  const active = body.active === true || /^active$/i.test(statusType)
  const teamRef = isRecord(body.team) ? str(body.team.$ref) : ''
  const teamMatch = teamRef.match(/teams\/(\d+)/)
  const headshot = isRecord(body.headshot) ? str(body.headshot.href) : ''
  const stats = isRecord(overview) && isRecord(overview.statistics) ? overview.statistics : {}
  const names = arr(stats.names).map((name) => str(name))
  const splits = arr(stats.splits)
  const regular =
    splits.find((split) => isRecord(split) && /regular/i.test(str(split.displayName))) ?? splits.find(isRecord)
  const values = isRecord(regular) ? arr(regular.stats).map((value) => str(value)) : []
  const display: Record<string, string> = {}
  const numbers: Record<string, number> = {}
  names.forEach((name, index) => {
    if (!name) return
    const value = values[index] || ''
    if (!value) return
    display[name] = value
    const parsed = parseStatNumber(value)
    if (parsed != null) numbers[name] = parsed
  })
  const full = str(body.displayName, hint?.name || 'Player')
  const first = str(body.firstName) || full.split(' ')[0] || ''
  const last = str(body.lastName) || full.split(' ').slice(-1)[0] || ''
  const latest = isRecord(overview) ? wireNote(overview.rotowire) : undefined
  const news = isRecord(overview)
    ? playerNotes(overview.news, { first, last, full }, latest?.headline || '')
    : []
  const college = collegeLookup(body.college)
  let collegeName = college.name
  if (!collegeName && college.id) {
    const school = await getJson(`${endpoints.core}/v2/colleges/${college.id}?lang=en`).catch(() => null)
    collegeName = isRecord(school) ? str(school.name) : ''
  }
  const drafted = draftBits(body.draft)
  const jersey = str(body.jersey)
  const experience = experienceLabel(body.experience)
  return {
    id,
    name: full,
    teamAbbr: '',
    position,
    active,
    ...(statusName && !/^active$/i.test(statusName) ? { status: statusName } : {}),
    ...(jersey ? { jersey } : {}),
    headshot: hint?.headshot || headshot || undefined,
    ...(collegeName ? { college: collegeName } : {}),
    ...(experience ? { experience } : {}),
    ...(drafted.text ? { draft: drafted.text } : {}),
    clubs: clubsFromSpans(clubSpans(seasonStats)),
    ...(latest ? { latest } : {}),
    ...(news.length ? { news } : {}),
    stats: display,
    numbers,
    ...(teamMatch ? { teamId: teamMatch[1] } : {}),
    ...(drafted.teamId ? { draftTeamId: drafted.teamId } : {}),
  }
}

export type PlayerCardDraft = PlayerCard & { teamId?: string; draftTeamId?: string }
