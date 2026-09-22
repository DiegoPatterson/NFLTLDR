/**
 * Preset scoring and the plain-language rules.
 * Points-per-yard values match the usual "1 point per 25 pass yards" and "1 per 10 rush/rec yards" style.
 * This is a summary for a home league, not a licensed rulebook.
 */
export type Scoring = {
  passYd: number
  passTd: number
  passInt: number
  rushYd: number
  rushTd: number
  rec: number
  recYd: number
  recTd: number
  fum: number
}

export type RosterSlots = {
  qb: number
  rb: number
  wr: number
  te: number
  flex: number
  dst: number
  k: number
  bench: number
}

export type PresetId = 'standard' | 'half' | 'ppr' | 'custom'

export type RulePreset = {
  id: Exclude<PresetId, 'custom'>
  name: string
  summary: string
  body: string
  scoring: Scoring
  slots: RosterSlots
}

const slots: RosterSlots = { qb: 1, rb: 2, wr: 2, te: 1, flex: 1, dst: 1, k: 1, bench: 6 }

const baseScore: Scoring = {
  passYd: 0.04,
  passTd: 4,
  passInt: -2,
  rushYd: 0.1,
  rushTd: 6,
  rec: 0,
  recYd: 0.1,
  recTd: 6,
  fum: -2,
}

export const scoringFields: { key: keyof Scoring; label: string; step: number }[] = [
  { key: 'passYd', label: 'Passing yard', step: 0.01 },
  { key: 'passTd', label: 'Passing touchdown', step: 1 },
  { key: 'passInt', label: 'Interception thrown', step: 1 },
  { key: 'rushYd', label: 'Rushing yard', step: 0.01 },
  { key: 'rushTd', label: 'Rushing touchdown', step: 1 },
  { key: 'rec', label: 'Reception', step: 0.5 },
  { key: 'recYd', label: 'Receiving yard', step: 0.01 },
  { key: 'recTd', label: 'Receiving touchdown', step: 1 },
  { key: 'fum', label: 'Fumble lost', step: 1 },
]

export const slotFields: { key: keyof RosterSlots; label: string }[] = [
  { key: 'qb', label: 'QB' },
  { key: 'rb', label: 'RB' },
  { key: 'wr', label: 'WR' },
  { key: 'te', label: 'TE' },
  { key: 'flex', label: 'FLEX' },
  { key: 'dst', label: 'DEF' },
  { key: 'k', label: 'K' },
  { key: 'bench', label: 'BENCH' },
]

export const presets: RulePreset[] = [
  {
    id: 'standard',
    name: 'Standard',
    summary: 'No points for a catch. Yards and touchdowns do the scoring.',
    body: 'A reception is worth nothing by itself. You still get a point for every 10 receiving yards and 6 for a receiving touchdown. Passing is lighter: a point for every 25 yards and 4 for a passing touchdown, with −2 for an interception. Rushing matches receiving on yards and touchdowns. A lost fumble is −2. Typical lineup is 1 QB, 2 RB, 2 WR, 1 TE, 1 flex, a team defense, a kicker, and a bench. Kickers and team defenses are on the roster, but this app’s rough total only counts the player stats it actually received.',
    scoring: { ...baseScore, rec: 0 },
    slots: { ...slots },
  },
  {
    id: 'half',
    name: 'Half PPR',
    summary: 'Half a point per catch. The usual home-league middle.',
    body: 'Same as standard, except each reception is worth 0.5. That gives receivers a small bump without making volume the whole game. This is the sheet the app starts you on. Change any number in the custom sheet and the rough totals on your roster follow the new math.',
    scoring: { ...baseScore, rec: 0.5 },
    slots: { ...slots },
  },
  {
    id: 'ppr',
    name: 'PPR',
    summary: 'A full point per catch. Volume receivers jump.',
    body: 'Each reception is worth 1, on top of the yardage and touchdown points. A player with 10 catches and 80 yards outscores a player with 2 catches and 80 yards by 8 points before touchdowns. Everything else matches the standard passing, rushing, and fumble numbers above.',
    scoring: { ...baseScore, rec: 1 },
    slots: { ...slots },
  },
]

export const defaultPreset = presets[1]
