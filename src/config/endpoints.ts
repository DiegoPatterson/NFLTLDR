/**
 * Where stats are read from. Change these if a feed moves.
 * site.api.espn.com is intentionally not used: it returns 403 on this network.
 * Betting fields that ride along in these payloads are ignored by the mappers.
 */
export const endpoints = {
  site: 'https://site.web.api.espn.com',
  core: 'https://sports.core.api.espn.com',
  cdnScoreboard: 'https://cdn.espn.com/core/nfl/scoreboard?xhr=1',
  sport: 'football',
  league: 'nfl',
  /** ESPN's NFL league id inside athlete uids (s:20~l:28~a:…). */
  nflLeagueUid: 'l:28',
  season: 2026,
}
