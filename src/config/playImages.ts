import type { ImageSourcePropType } from 'react-native'

export type PlayShot = {
  source: ImageSourcePropType
  note: string
  tall?: boolean
}

const commons = (path: string): ImageSourcePropType => ({ uri: `https://upload.wikimedia.org/wikipedia/commons/${path}` })

/** A Commons file by its name. SVGs need a width so the phone gets a PNG. */
const file = (name: string, width?: number): ImageSourcePropType => {
  const base = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(name)}`
  return { uri: width ? `${base}?width=${width}` : base }
}

/** These read from the name. They do not get a picture or a "no diagram" line. */
export const plainPlays = new Set(['cover-1', 'cover-2-man', 'sneak', 'hot', 'motion', 'sit-short'])

/** Published diagrams from Wikimedia Commons. No guessed drawing is used. */
export const playShots: Record<string, PlayShot[]> = {
  '11': [{ source: require('../../assets/playbook/ace.png') as number, note: '11 personnel, under center.' }],
  '21': [{ source: commons('0/0a/I-form_green.PNG'), note: 'I formation. Two backs in a line.' }],
  empty: [{ source: commons('thumb/d/d7/5-wide_green.svg/960px-5-wide_green.svg.png'), note: 'Five receivers, no tight end.' }],
  gun: [
    { source: require('../../assets/playbook/shotgun.png') as number, note: 'Shotgun. The back is beside the quarterback.' },
    { source: require('../../assets/playbook/pistol.png') as number, note: 'Pistol. The back is directly behind him.' },
  ],
  trips: [{ source: require('../../assets/playbook/trips.png') as number, note: 'Trips. Three receivers to one side.' }],
  toss: [{ source: commons('b/b3/FB-toss-sweep.png'), note: 'Toss sweep.', tall: true }],
  power: [{ source: file('I-Form Power Example.png'), note: 'Power from the I. A guard pulls and leads the back.', tall: true }],
  rpo: [
    {
      source: file('Double slant RPO against a cover 6.png'),
      note: 'One common RPO: inside zone, or double slants if the linebacker fits the run.',
      tall: true,
    },
  ],
  flood: [
    {
      source: file('Sail route.svg', 800),
      note: 'Sail, a flood. Three routes at three depths to one side.',
      tall: true,
    },
  ],
  bubble: [
    {
      source: file('Bubble Screen Example (2).png'),
      note: 'Bubble screen against a 3-4. The slot catches it behind the line.',
      tall: true,
    },
  ],
  stunt: [
    {
      source: file('DE-DT stunt (gridiron football).jpg'),
      note: 'A stunt. The end and the tackle cross after the snap.',
    },
  ],
  slant: [{ source: commons('4/4d/Slant_route.png'), note: 'Slant.', tall: true }],
  hitch: [{ source: commons('e/ed/Hitch_route.png'), note: 'Hitch.', tall: true }],
  out: [{ source: commons('3/36/Out_route.png'), note: 'Out.' }],
  flat: [{ source: commons('b/b4/Flat_route.png'), note: 'Flat.', tall: true }],
  'corner-route': [{ source: require('../../assets/playbook/corner.png') as number, note: 'Corner route. A short one and a deep one.', tall: true }],
  post: [{ source: commons('4/42/Post_route.png'), note: 'Post.', tall: true }],
  wheel: [{ source: commons('3/3e/Wheel_route.png'), note: 'Wheel.', tall: true }],
  fade: [{ source: commons('9/95/Fly_route.png'), note: 'Go, also called a fly or a fade.', tall: true }],
  flea: [{ source: require('../../assets/playbook/flea.png') as number, note: 'Flea flicker. Follow the numbered arrows.', tall: true }],
  nickel: [
    { source: commons('7/7d/4-2-5_green.PNG'), note: 'Nickel. Five defensive backs.' },
    { source: commons('5/5e/Dime_green.PNG'), note: 'Dime. Six defensive backs.' },
  ],
  'cover-2': [{ source: commons('thumb/3/3f/Cover_2.svg/960px-Cover_2.svg.png'), note: 'Cover 2. Two deep safeties.' }],
  'cover-3': [{ source: commons('thumb/0/06/Cover_3.svg/960px-Cover_3.svg.png'), note: 'Cover 3. One deep middle, two corners deep.' }],
  'cover-4': [{ source: commons('thumb/2/2c/Cover_4.svg/960px-Cover_4.svg.png'), note: 'Cover 4. Four deep defenders.' }],
  'cover-6': [{ source: commons('thumb/a/a8/Cover_6.svg/960px-Cover_6.svg.png'), note: 'Cover 6. The two sides do not match.' }],
  'sit-hitch': [{ source: commons('e/ed/Hitch_route.png'), note: 'The hitch he is jumping.', tall: true }],
  'sit-cover2': [{ source: commons('thumb/3/3f/Cover_2.svg/960px-Cover_2.svg.png'), note: 'The cover 2 look.' }],
  'sit-cover3': [{ source: commons('thumb/0/06/Cover_3.svg/960px-Cover_3.svg.png'), note: 'The cover 3 look.' }],
  'sit-quarters': [{ source: commons('thumb/2/2c/Cover_4.svg/960px-Cover_4.svg.png'), note: 'The quarters look.' }],
  'sit-red': [{ source: commons('9/95/Fly_route.png'), note: 'The fade.', tall: true }],
  'sit-screen': [
    {
      source: file('Bubble Screen Example (2).png'),
      note: 'The screen they are flying up on. The next call is the throw behind them.',
      tall: true,
    },
  ],
  'sit-two-minute': [{ source: commons('3/36/Out_route.png'), note: 'An out. It ends at the sideline so he can get out of bounds.' }],
}
