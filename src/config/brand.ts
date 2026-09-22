/**
 * Edit this file to rename the app, change the tagline, or swap the logo.
 * Screens read these values. They do not hardcode the name.
 *
 * The icon shown by the phone's home screen is separate: it is
 * assets/images/icon.png, wired in app.json, because Expo reads that
 * file before any of this TypeScript runs. Change both if you rebrand.
 */
export const brand = {
  name: 'FootballTLDR',
  shortName: 'TLDR',
  tagline: 'The stats that matter.',
  /** How long the animated load screen stays up, unless the viewer taps through. */
  splashMs: 2400,
  /**
   * Set useCustomLogo to true after pointing `logo` at your own file, e.g.
   * logo: require('../../assets/images/icon.png')
   * Leave the flag false to keep the drawn football mark.
   */
  useCustomLogo: false,
  /** Full icon, grass included. This is what the phone home screen uses. */
  logo: require('../../assets/images/icon.png') as number,
  /** Same football with the grass removed, so the startup can sit on team colors. */
  mark: require('../../assets/images/mark.png') as number,
}
