/** Switches and timers. Turn a block off here instead of deleting a screen. */
export const features = {
  ticker: true,
  startSit: true,
  exportFantasy: true,
  showUpcomingStrip: true,
  showDivisionSnapshot: true,
  /**
   * How often the scoreboard is asked again while a game is in progress
   * and the screen is open. Fifteen seconds. The on-screen clock ticks
   * between checks and snaps back to this reply.
   */
  liveRefreshMs: 15_000,
  /** Slower poll in the hours before kickoff, so the card flips to live without a manual refresh. */
  soonRefreshMs: 60000,
  /** Start polling this long before kickoff. */
  soonWindowMs: 3 * 60 * 60 * 1000,
  ttl: {
    scoreboardMs: 25_000,
    teamsMs: 12 * 60 * 60 * 1000,
    standingsMs: 10 * 60 * 1000,
    newsMs: 5 * 60 * 1000,
    teamMs: 10 * 60 * 1000,
    gameMs: 20_000,
    playerMs: 6 * 60 * 60 * 1000,
    searchMs: 60 * 1000,
    playerIndexMs: 12 * 60 * 60 * 1000,
  },
}
