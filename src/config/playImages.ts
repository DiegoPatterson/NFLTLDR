import type { ImageSourcePropType } from 'react-native'

export type PlayShot = {
  source: ImageSourcePropType
  note: string
  tall?: boolean
}

/**
 * Diagrams ship inside the app. The installed build was failing on Wikimedia,
 * which blocks the phone's image loader. A few files that could not be saved
 * still use a thumbnail address, with a browser-style header.
 */
const remote = (name: string): ImageSourcePropType => ({
  uri: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(name)}?width=960`,
  headers: {
    Accept: 'image/png,image/jpeg,*/*',
    Referer: 'https://commons.wikimedia.org/',
    'User-Agent': 'FootballTLDR/1.0 (personal NFL study app)',
  },
})

/** These read from the name. They do not get a picture or a "no diagram" line. */
export const plainPlays = new Set(['cover-1', 'cover-2-man', 'sneak', 'hot', 'motion', 'sit-short'])

/** Published diagrams. No guessed drawing is used. */
export const playShots: Record<string, PlayShot[]> = {
  '11': [{ source: require('../../assets/playbook/ace.png') as number, note: '11 personnel, under center.' }],
  '21': [{ source: require('../../assets/playbook/iform.png') as number, note: 'I formation. Two backs in a line.' }],
  empty: [{ source: require('../../assets/playbook/empty.png') as number, note: 'Five receivers, no tight end.' }],
  gun: [
    { source: require('../../assets/playbook/shotgun.png') as number, note: 'Shotgun. The back is beside the quarterback.' },
    { source: require('../../assets/playbook/pistol.png') as number, note: 'Pistol. The back is directly behind him.' },
  ],
  trips: [{ source: require('../../assets/playbook/trips.png') as number, note: 'Trips. Three receivers to one side.' }],
  toss: [{ source: require('../../assets/playbook/toss.png') as number, note: 'Toss sweep.', tall: true }],
  power: [{ source: remote('I-Form Power Example.png'), note: 'Power from the I. A guard pulls and leads the back.', tall: true }],
  rpo: [
    {
      source: require('../../assets/playbook/rpo.png') as number,
      note: 'One common RPO: inside zone, or double slants if the linebacker fits the run.',
      tall: true,
    },
  ],
  flood: [
    {
      source: require('../../assets/playbook/sail.webp') as number,
      note: 'Sail, a flood. Three routes at three depths to one side.',
      tall: true,
    },
  ],
  bubble: [
    {
      source: require('../../assets/playbook/bubble.png') as number,
      note: 'Bubble screen against a 3-4. The slot catches it behind the line.',
      tall: true,
    },
  ],
  stunt: [
    {
      source: require('../../assets/playbook/stunt.jpg') as number,
      note: 'A stunt. The end and the tackle cross after the snap.',
    },
  ],
  slant: [{ source: require('../../assets/playbook/slant.png') as number, note: 'Slant.', tall: true }],
  hitch: [{ source: require('../../assets/playbook/hitch.png') as number, note: 'Hitch.', tall: true }],
  out: [{ source: require('../../assets/playbook/out.png') as number, note: 'Out.' }],
  flat: [{ source: require('../../assets/playbook/flat.png') as number, note: 'Flat.', tall: true }],
  'corner-route': [{ source: require('../../assets/playbook/corner.png') as number, note: 'Corner route. A short one and a deep one.', tall: true }],
  post: [{ source: require('../../assets/playbook/post.png') as number, note: 'Post.', tall: true }],
  wheel: [{ source: require('../../assets/playbook/wheel.png') as number, note: 'Wheel.', tall: true }],
  fade: [{ source: require('../../assets/playbook/fade.png') as number, note: 'Go, also called a fly or a fade.', tall: true }],
  flea: [{ source: require('../../assets/playbook/flea.png') as number, note: 'Flea flicker. Follow the numbered arrows.', tall: true }],
  nickel: [
    { source: require('../../assets/playbook/nickel.png') as number, note: 'Nickel. Five defensive backs.' },
    { source: require('../../assets/playbook/dime.png') as number, note: 'Dime. Six defensive backs.' },
  ],
  'cover-2': [{ source: require('../../assets/playbook/cover2.png') as number, note: 'Cover 2. Two deep safeties.' }],
  'cover-3': [{ source: require('../../assets/playbook/cover3.png') as number, note: 'Cover 3. One deep middle, two corners deep.' }],
  'cover-4': [{ source: require('../../assets/playbook/cover4.png') as number, note: 'Cover 4. Four deep defenders.' }],
  'cover-6': [{ source: require('../../assets/playbook/cover6.png') as number, note: 'Cover 6. The two sides do not match.' }],
  'sit-hitch': [{ source: require('../../assets/playbook/hitch.png') as number, note: 'The hitch he is jumping.', tall: true }],
  'sit-cover2': [{ source: require('../../assets/playbook/cover2.png') as number, note: 'The cover 2 look.' }],
  'sit-cover3': [{ source: require('../../assets/playbook/cover3.png') as number, note: 'The cover 3 look.' }],
  'sit-quarters': [{ source: require('../../assets/playbook/cover4.png') as number, note: 'The quarters look.' }],
  'sit-red': [{ source: require('../../assets/playbook/fade.png') as number, note: 'The fade.', tall: true }],
  'sit-screen': [
    {
      source: require('../../assets/playbook/bubble.png') as number,
      note: 'The screen they are flying up on. The next call is the throw behind them.',
      tall: true,
    },
  ],
  'sit-two-minute': [{ source: require('../../assets/playbook/out.png') as number, note: 'An out. It ends at the sideline so he can get out of bounds.' }],
}
