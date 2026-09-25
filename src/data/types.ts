export type GameState = 'pre' | 'in' | 'post'

export type Side = {
  id: string
  abbr: string
  name: string
  shortName: string
  score: string
  record?: string
  color: string
  logo?: string
  homeAway: 'home' | 'away'
}

export type SlateGame = {
  id: string
  shortName: string
  date: string
  state: GameState
  /** Week label from the feed, such as "Week 1". */
  week?: string
  detail: string
  possessionId?: string
  downLine?: string
  redZone?: boolean
  broadcast?: string
  venue?: string
  home: Side
  away: Side
}

export type StatChip = {
  label: string
  value: string
  glossary?: string
}

export type CompareRow = {
  label: string
  glossary?: string
  away: string
  home: string
}

export type Leader = {
  category: string
  name: string
  line: string
  teamId?: string
}

export type Injury = {
  name: string
  position: string
  status: string
  teamAbbr?: string
}

export type GameDetail = {
  game: SlateGame
  pace: boolean
  rows: CompareRow[]
  more: CompareRow[]
  leaders: Leader[]
  injuries: Injury[]
  updatedAt: number
  stale: boolean
}

export type DigestSection = {
  id: string
  title: string
  blurb: string
  main: StatChip[]
  more: StatChip[]
}

export type DivisionRow = {
  id: string
  abbr: string
  name: string
  record: string
  wins: number
  yours: boolean
}

export type Digest = {
  teamId: string
  abbr: string
  name: string
  shortName: string
  color: string
  alt: string
  logo?: string
  record: string
  standing: string
  streak: string
  pointsFor: string
  pointsAgainst: string
  pointsForLabel: string
  pointsAgainstLabel: string
  tldr: string
  next?: SlateGame
  last?: SlateGame
  /** Finished games this season, newest first. */
  results: SlateGame[]
  sections: DigestSection[]
  leaders: Leader[]
  injuries: Injury[]
  notes: SidelineNote[]
  division: DivisionRow[]
  updatedAt: number
  stale: boolean
}

export type Article = {
  id: string
  headline: string
  description: string
  big: boolean
  categories?: string
}

export type SidelineNote = {
  headline: string
  detail: string
}

export type CatalogTeam = {
  id: string
  abbr: string
  name: string
  city: string
  conference: 'AFC' | 'NFC'
  division: string
  color: string
  alt: string
  logo?: string
  record?: string
}

export type PlayerHit = {
  id: string
  name: string
  teamName: string
  position?: string
  headshot?: string
}

export type PlayerClub = {
  teamId: string
  name: string
  abbr: string
  from: number
  to: number
}

export type PlayerNote = {
  headline: string
  detail: string
  when?: string
}

export type PlayerCard = {
  id: string
  name: string
  teamAbbr: string
  /** Full club name for the open card. Pins keep the abbreviation. */
  teamName?: string
  /** Abbreviation from the feed. */
  position: string
  /** On an NFL roster right now. Retired and inactive players stay viewable, but off the fantasy sheet. */
  active: boolean
  /** Feed status word, such as Inactive. Omitted when it is just Active. */
  status?: string
  jersey?: string
  headshot?: string
  college?: string
  experience?: string
  draft?: string
  /** Clubs from the season stat feed, earliest first. Empty when that feed has no team column. */
  clubs?: PlayerClub[]
  latest?: PlayerNote
  news?: PlayerNote[]
  /** Injury-report line. Absent when he is not on the report. */
  injury?: string
  injuryNote?: string
  stats: Record<string, string>
  numbers: Record<string, number>
}

export type StandingRow = {
  teamId: string
  record: string
  wins: number
  streak: string
  pointsFor: string
  pointsAgainst: string
  /** ESPN's current playoff seed inside the conference. 1 is the bye. */
  seed?: number
}
