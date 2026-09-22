/**
 * Which numbers are "the ones people look up" versus the rest.
 * `source` is the feed's name for that stat. If the feed drops a name, the row hides.
 * Glossary ids point at `glossary` below.
 */
export type StatSpec = {
  source: string
  label: string
  glossary?: string
}

export type SectionSpec = {
  id: string
  title: string
  blurb: string
  main: StatSpec[]
  more: StatSpec[]
}

export const glossary: Record<string, string> = {
  ppg: 'Points per game. A scoring average, not one night.',
  pa: 'Points allowed per game. The lower number is the better defense.',
  pass: 'Net passing yards. Sacks count against this.',
  rush: 'Rushing yards.',
  third: 'Third down. How often a drive stays alive on third down.',
  rz: 'Red zone touchdown rate. Inside the 20, how often they score a touchdown.',
  margin: 'Turnover margin. Takeaways minus giveaways. Positive is good.',
  first: 'First downs per game. A blunt "did the offense move" number.',
  sacks: 'Sacks. How often the defense drops the quarterback.',
  take: 'Takeaways. Interceptions plus recovered fumbles.',
  ints: 'Interceptions by the defense.',
  tfl: 'Tackles for loss. Stops behind the line of scrimmage.',
  yds: 'Total yards for this game.',
  to: 'Turnovers in this game. Interceptions plus lost fumbles.',
  top: 'Time of possession. How long that side held the ball.',
  ypp: 'Yards per play. Efficiency, not volume.',
  pen: 'Penalties and penalty yards, shown as count-yards.',
  rtg: 'Passer rating. A formula, not a grade out of 100. Around 90 is solid, over 100 is sharp.',
  qbr: 'ESPN’s total QBR, scaled to 100. Different math from passer rating.',
  ypc: 'Yards per carry.',
  ypr: 'Yards per reception.',
}

export const seasonSections: SectionSpec[] = [
  {
    id: 'offense',
    title: 'Offense',
    blurb: 'How they score and how they move it. Open for the finishing and ball-security numbers.',
    main: [
      { source: 'scoring.totalPointsPerGame', label: 'Points / game', glossary: 'ppg' },
      { source: 'passing.netPassingYardsPerGame', label: 'Pass yds / game', glossary: 'pass' },
      { source: 'rushing.rushingYardsPerGame', label: 'Rush yds / game', glossary: 'rush' },
      { source: 'miscellaneous.thirdDownConvPct', label: 'Third down %', glossary: 'third' },
    ],
    more: [
      { source: 'miscellaneous.redzoneTouchdownPct', label: 'Red zone TD %', glossary: 'rz' },
      { source: 'miscellaneous.turnOverDifferential', label: 'Turnover margin', glossary: 'margin' },
      { source: 'miscellaneous.firstDownsPerGame', label: 'First downs / game', glossary: 'first' },
    ],
  },
  {
    id: 'defense',
    title: 'Defense',
    blurb: 'What they give up, and how they get the ball back.',
    main: [
      { source: 'record.avgPointsAgainst', label: 'Points allowed / game', glossary: 'pa' },
      { source: 'defensive.sacks', label: 'Sacks', glossary: 'sacks' },
      { source: 'miscellaneous.totalTakeaways', label: 'Takeaways', glossary: 'take' },
    ],
    more: [
      { source: 'defensiveInterceptions.interceptions', label: 'Interceptions', glossary: 'ints' },
      { source: 'defensive.tacklesForLoss', label: 'Tackles for loss', glossary: 'tfl' },
      { source: 'defensive.sackYards', label: 'Sack yards', glossary: 'sacks' },
    ],
  },
]

/** Box score rows once a game has started or ended. */
export const liveCompare: { main: StatSpec[]; more: StatSpec[] } = {
  main: [
    { source: 'totalYards', label: 'Yards', glossary: 'yds' },
    { source: 'netPassingYards', label: 'Pass', glossary: 'pass' },
    { source: 'rushingYards', label: 'Rush', glossary: 'rush' },
    { source: 'thirdDownEff', label: 'Third down', glossary: 'third' },
    { source: 'turnovers', label: 'Turnovers', glossary: 'to' },
    { source: 'possessionTime', label: 'Possession', glossary: 'top' },
  ],
  more: [
    { source: 'redZoneAttempts', label: 'Red zone', glossary: 'rz' },
    { source: 'sacksYardsLost', label: 'Sacks allowed', glossary: 'sacks' },
    { source: 'firstDowns', label: 'First downs', glossary: 'first' },
    { source: 'yardsPerPlay', label: 'Yards / play', glossary: 'ypp' },
    { source: 'totalPenaltiesYards', label: 'Penalties', glossary: 'pen' },
    { source: 'fourthDownEff', label: 'Fourth down', glossary: 'third' },
  ],
}

/** Shown before kickoff. These are season rates, and the screen says so. */
export const previewCompare: { main: StatSpec[]; more: StatSpec[] } = {
  main: [
    { source: 'totalPointsPerGame', label: 'Points / game', glossary: 'ppg' },
    { source: 'yardsPerGame', label: 'Yards / game', glossary: 'yds' },
    { source: 'passingYardsPerGame', label: 'Pass yds / game', glossary: 'pass' },
    { source: 'rushingYardsPerGame', label: 'Rush yds / game', glossary: 'rush' },
  ],
  more: [
    { source: 'totalPointsPerGameAllowed', label: 'Points allowed / game', glossary: 'pa' },
    { source: 'yardsPerGameAllowed', label: 'Yards allowed / game', glossary: 'yds' },
  ],
}

/** Preferred stat names, by position, for a fantasy card. */
export const playerLine: Record<string, { main: string[]; more: string[] }> = {
  QB: {
    main: ['completions', 'passingAttempts', 'passingYards', 'passingTouchdowns', 'interceptions'],
    more: ['QBRating', 'rushingYards', 'rushingTouchdowns'],
  },
  RB: {
    main: ['rushingAttempts', 'rushingYards', 'rushingTouchdowns', 'yardsPerRushAttempt'],
    more: ['receptions', 'receivingYards', 'receivingTouchdowns'],
  },
  WR: {
    main: ['receptions', 'receivingYards', 'receivingTouchdowns', 'yardsPerReception'],
    more: ['receivingTargets', 'rushingYards'],
  },
  TE: {
    main: ['receptions', 'receivingYards', 'receivingTouchdowns', 'yardsPerReception'],
    more: ['receivingTargets', 'rushingYards'],
  },
  K: {
    main: ['fieldGoalsMade', 'fieldGoalAttempts', 'extraPointsMade'],
    more: ['fieldGoalPct'],
  },
  DEF: {
    main: ['sacks', 'interceptions', 'totalTackles'],
    more: ['forcedFumbles'],
  },
}

export const playerLineDefault = {
  main: ['tackles', 'sacks', 'interceptions'],
  more: ['passesDefended', 'forcedFumbles'],
}

export const statLabels: Record<string, string> = {
  completions: 'CMP',
  passingAttempts: 'ATT',
  passingYards: 'PASS YDS',
  passingTouchdowns: 'PASS TD',
  interceptions: 'INT',
  QBRating: 'RTG',
  rushingAttempts: 'CAR',
  rushingYards: 'RUSH YDS',
  rushingTouchdowns: 'RUSH TD',
  yardsPerRushAttempt: 'YPC',
  receptions: 'REC',
  receivingYards: 'REC YDS',
  receivingTouchdowns: 'REC TD',
  yardsPerReception: 'YPR',
  receivingTargets: 'TGT',
  sacks: 'SACK',
  totalTackles: 'TKL',
  tackles: 'TKL',
  fieldGoalsMade: 'FGM',
  fieldGoalAttempts: 'FGA',
  extraPointsMade: 'XP',
  fieldGoalPct: 'FG%',
  passesDefended: 'PD',
  forcedFumbles: 'FF',
}

export const statGlossary: Record<string, string> = {
  QBRating: 'rtg',
  yardsPerRushAttempt: 'ypc',
  yardsPerReception: 'ypr',
}
