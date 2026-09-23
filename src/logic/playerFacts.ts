import { newsRules } from '@/src/config/newsRules'
import { arr, isRecord, str } from '@/src/data/json'
import type { PlayerClub, PlayerNote } from '@/src/data/types'

const betting = new RegExp(newsRules.bettingPattern, 'i')
const lifestyle = /\b(mansion|wedding|taylor swift|\bdog\b|married|purchased)\b/i
const skipInjury = /^(active|healthy|probable)$/i

export type ClubSpan = { teamId: string; slug: string; from: number; to: number }
export type InjuryLine = { line: string; note: string }

export function nameFromSlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function yearSpan(from: number, to: number): string {
  if (!from) return ''
  if (!to || from === to) return String(from)
  return `${from}–${to}`
}

/** Season rows on the stats feed. A gap starts a new run so a return does not look continuous. */
export function clubSpans(json: unknown): ClubSpan[] {
  const root = isRecord(json) ? json : {}
  const seen = new Set<string>()
  const events: { year: number; teamId: string; slug: string }[] = []
  for (const category of arr(root.categories)) {
    if (!isRecord(category)) continue
    for (const row of arr(category.statistics)) {
      if (!isRecord(row)) continue
      const teamId = str(row.teamId)
      const season = isRecord(row.season) ? row.season : {}
      const year = Number(season.year)
      if (!teamId || !Number.isFinite(year)) continue
      const key = `${year}:${teamId}`
      if (seen.has(key)) continue
      seen.add(key)
      events.push({ year, teamId, slug: str(row.teamSlug) })
    }
  }
  events.sort((a, b) => a.year - b.year || a.teamId.localeCompare(b.teamId))
  const runs: ClubSpan[] = []
  for (const event of events) {
    const last = runs[runs.length - 1]
    if (last && last.teamId === event.teamId && event.year <= last.to + 1) {
      last.to = event.year
      if (!last.slug) last.slug = event.slug
    } else {
      runs.push({ teamId: event.teamId, slug: event.slug, from: event.year, to: event.year })
    }
  }
  return runs
}

export function clubsFromSpans(spans: ClubSpan[]): PlayerClub[] {
  return spans
    .map((span) => ({
      teamId: span.teamId,
      name: nameFromSlug(span.slug),
      abbr: '',
      from: span.from,
      to: span.to,
    }))
    .filter((club) => club.name || club.teamId)
}

export function experienceLabel(raw: unknown): string {
  const years = isRecord(raw) ? Number(raw.years) : Number(raw)
  if (!Number.isFinite(years) || years <= 0) return ''
  return years === 1 ? '1 year' : `${years} years`
}

export function collegeLookup(raw: unknown): { name: string; id: string } {
  if (!isRecord(raw)) return { name: '', id: '' }
  const name = str(raw.name)
  const ref = str(raw.$ref)
  const id = name ? '' : ref.match(/colleges\/(\d+)/)?.[1] || ''
  return { name, id }
}

export function draftBits(raw: unknown): { text: string; teamId: string } {
  if (!isRecord(raw)) return { text: '', teamId: '' }
  const year = str(raw.year)
  const round = str(raw.round)
  const pick = str(raw.selection)
  const text = [year, round && `round ${round}`, pick && `pick ${pick}`].filter(Boolean).join(', ')
  const ref = isRecord(raw.team) ? str(raw.team.$ref) : ''
  return { text, teamId: ref.match(/teams\/(\d+)/)?.[1] || '' }
}

export function shortDate(raw: string): string {
  const match = raw.match(
    /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})\b.*?\b(\d{4})\b/,
  )
  if (!match) return ''
  return `${match[1]} ${Number(match[2])}, ${match[3]}`
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** True when the text is about this player, not a relative who shares the last name. */
export function aboutPlayer(text: string, first: string, last: string, full: string): boolean {
  if (!text) return false
  const lower = text.toLowerCase()
  if (full && lower.includes(full.toLowerCase())) return true
  if (!last || !lower.includes(last.toLowerCase())) return false
  if (!first) return true
  const other = new RegExp(`\\b(?!${escapeRegExp(first)}\\b)[A-Z][\\w'.-]+\\s+${escapeRegExp(last)}\\b`, 'g')
  const stripped = text.replace(other, ' ')
  return new RegExp(`\\b${escapeRegExp(last)}\\b`, 'i').test(stripped)
}

export function wireNote(raw: unknown): PlayerNote | undefined {
  if (!isRecord(raw)) return undefined
  const headline = str(raw.headline).trim()
  const detail = (str(raw.story) || str(raw.description)).trim()
  if (!headline && !detail) return undefined
  if (betting.test(`${headline} ${detail}`)) return undefined
  const when = shortDate(str(raw.published))
  return {
    headline: headline || detail,
    detail: detail && detail !== headline ? detail : '',
    ...(when ? { when } : {}),
  }
}

export function playerNotes(
  news: unknown,
  person: { first: string; last: string; full: string },
  skipHeadline = '',
): PlayerNote[] {
  const rows = arr(news)
    .map((item, index) => {
      if (!isRecord(item)) return null
      const headline = str(item.headline).trim()
      const detail = str(item.description).trim()
      const blob = `${headline} ${detail}`
      if (!headline || betting.test(blob) || lifestyle.test(blob)) return null
      if (skipHeadline && headline.toLowerCase() === skipHeadline.toLowerCase()) return null
      if (!aboutPlayer(blob, person.first, person.last, person.full)) return null
      return {
        index,
        note: {
          headline,
          detail: detail && detail !== headline ? detail : '',
        } satisfies PlayerNote,
      }
    })
    .filter((item): item is { index: number; note: PlayerNote } => item != null)
  return rows.slice(0, 2).map((item) => item.note)
}

function athleteId(athlete: Record<string, unknown>): string {
  const direct = str(athlete.id)
  if (direct) return direct
  for (const link of arr(athlete.links)) {
    if (!isRecord(link)) continue
    const href = str(link.href)
    const match = href.match(/\/id\/(\d+)/) || href.match(/~a:(\d+)/)
    if (match) return match[1]
  }
  return ''
}

function usable(value: string): string {
  const text = value.trim()
  if (!text || /not specified/i.test(text)) return ''
  return text
}

function injuryRank(status: string): number {
  const name = status.toLowerCase()
  if (/\bout\b|reserve|pup|nfi|suspend/.test(name)) return 3
  if (/doubt/.test(name)) return 2
  return 1
}

function injuryLine(status: string, details: unknown): string {
  if (!isRecord(details)) return status
  const side = usable(str(details.side))
  const type = usable(str(details.type))
  const extra = usable(str(details.detail))
  const place = [side, type.toLowerCase()].filter(Boolean).join(' ')
  const pretty = place ? place.charAt(0).toUpperCase() + place.slice(1) : ''
  const extraBit = extra && extra.toLowerCase() !== type.toLowerCase() ? extra.toLowerCase() : ''
  const rest = [pretty, extraBit].filter(Boolean).join(', ')
  return rest ? `${status} · ${rest}` : status
}

function injuryNote(item: Record<string, unknown>, status: string): string {
  const long = str(item.longComment).trim()
  const short = str(item.shortComment).trim()
  const text = long.length >= short.length ? long : short
  if (!text || text.toLowerCase() === status.toLowerCase()) return ''
  if (betting.test(text)) return ''
  return text
}

export function injuriesByPlayer(json: unknown): Record<string, InjuryLine> {
  const root = isRecord(json) ? json : {}
  const found = new Map<string, { rank: number; line: InjuryLine }>()
  for (const team of arr(root.injuries)) {
    if (!isRecord(team)) continue
    for (const item of arr(team.injuries)) {
      if (!isRecord(item)) continue
      const status = str(item.status).trim()
      if (!status || skipInjury.test(status)) continue
      const athlete = isRecord(item.athlete) ? item.athlete : {}
      const id = athleteId(athlete)
      if (!id) continue
      const rank = injuryRank(status)
      const line = { line: injuryLine(status, item.details), note: injuryNote(item, status) }
      const prev = found.get(id)
      if (!prev || rank > prev.rank) found.set(id, { rank, line })
    }
  }
  const out: Record<string, InjuryLine> = {}
  for (const [id, entry] of found) out[id] = entry.line
  return out
}
