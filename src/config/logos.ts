/**
 * Official club marks, from the public ESPN team-logo URL.
 * Personal, non-commercial use. If that URL moves, change it here.
 * Screens should not paste a logo address anywhere else.
 */
export function officialLogo(abbr: string): string {
  return `https://a.espncdn.com/i/teamlogos/nfl/500/${abbr.toLowerCase()}.png`
}
