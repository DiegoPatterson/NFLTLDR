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
  headshot?: string
}

export type PlayerCard = {
  id: string
  name: string
  teamAbbr: string
  position: string
  /** On an NFL roster right now. Retired and inactive players stay viewable, but off the fantasy sheet. */
  active: boolean
  headshot?: string
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
}
