/**
 * The two colors each club's theme must show.
 * `field` dyes the background and cards. `accent` is the pop: buttons, labels, and half the header stripe.
 * Both are used. The theme does not collapse a team down to one of them.
 *
 * Feed colors are a bad source for this. ESPN's "alternate" is often black or white,
 * which dropped Ravens gold, Chargers yellow, and Dolphins orange.
 * Edit a pair here if a club looks wrong.
 */
export type BrandPair = {
  field: string
  accent: string
}

export const teamBrand: Record<string, BrandPair> = {
  BUF: { field: '#00338D', accent: '#C60C30' },
  MIA: { field: '#008E97', accent: '#FC4C02' },
  NE: { field: '#002244', accent: '#C60C30' },
  NYJ: { field: '#125740', accent: '#FFFFFF' },
  BAL: { field: '#241773', accent: '#C5A572' },
  CIN: { field: '#000000', accent: '#FB4F14' },
  CLE: { field: '#311D00', accent: '#FF3C00' },
  PIT: { field: '#101820', accent: '#FFB612' },
  HOU: { field: '#03202F', accent: '#A71930' },
  IND: { field: '#002C5F', accent: '#FFFFFF' },
  JAX: { field: '#006778', accent: '#D7A22A' },
  TEN: { field: '#0C2340', accent: '#4B92DB' },
  DEN: { field: '#002244', accent: '#FB4F14' },
  KC: { field: '#E31837', accent: '#FFB81C' },
  LV: { field: '#000000', accent: '#A5ACAF' },
  LAC: { field: '#0080C6', accent: '#FFC20E' },
  DAL: { field: '#041E42', accent: '#869397' },
  NYG: { field: '#0B2265', accent: '#A71930' },
  PHI: { field: '#004C54', accent: '#A5ACAF' },
  WSH: { field: '#5A1414', accent: '#FFB612' },
  CHI: { field: '#0B162A', accent: '#C83803' },
  DET: { field: '#0076B6', accent: '#B0B7BC' },
  GB: { field: '#203731', accent: '#FFB612' },
  MIN: { field: '#4F2683', accent: '#FFC62F' },
  ATL: { field: '#000000', accent: '#A71930' },
  CAR: { field: '#000000', accent: '#0085CA' },
  NO: { field: '#101820', accent: '#D3BC8D' },
  TB: { field: '#34302B', accent: '#D50A0A' },
  ARI: { field: '#000000', accent: '#97233F' },
  LAR: { field: '#003594', accent: '#FFD100' },
  SF: { field: '#AA0000', accent: '#B3995D' },
  SEA: { field: '#002244', accent: '#69BE28' },
}

/** Optional edits on top of teamBrand. Set field, accent, or both. */
export const teamColorOverrides: Record<string, Partial<BrandPair>> = {}
