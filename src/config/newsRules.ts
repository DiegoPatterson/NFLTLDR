/**
 * What counts as big enough for the scrolling bar.
 * The pattern is a case-insensitive regular expression tested against the headline.
 * Score changes in live games are added by the app itself; they are not part of this pattern.
 */
export const newsRules = {
  /**
   * Ticker only. Inactives are not "breaking" — they belong on the game card.
   * Edit this pattern to let more (or less) into the bar.
   */
  bigPattern:
    '\\b(torn|\\bacl\\b|achilles|suspension|suspended|fired|benched|traded|fracture|surgery|injured reserve)\\b',
  /** Drop odds and betting writeups everywhere. This app does not show lines. */
  bettingPattern: '\\b(odds|betting|spread|survivor|how to bet|moneyline)\\b',
  /** Coach or player quotes worth a short note under your team. */
  voicePattern: '\\b(coach|said|says|interview|statement|told reporters|press conference)\\b',
  maxTicker: 6,
  maxList: 3,
  maxSideline: 2,
}
