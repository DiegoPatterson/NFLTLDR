/**
 * The 32 clubs, used for divisions and as a fallback when the feed is down.
 * Colors here are the fallback. The feed wins unless teamColors.ts overrides.
 * Ids were taken from the public team list on 2026-09-21.
 */
export type Conference = 'AFC' | 'NFC'
export type DivisionName = 'East' | 'North' | 'South' | 'West'

export type StaticTeam = {
  id: string
  abbr: string
  name: string
  city: string
  conference: Conference
  division: DivisionName
  color: string
  alt: string
}

export const conferenceOrder: Conference[] = ['AFC', 'NFC']
export const divisionOrder: DivisionName[] = ['East', 'North', 'South', 'West']

export const nflTeams: StaticTeam[] = [
  { id: '2', abbr: 'BUF', name: 'Buffalo Bills', city: 'Buffalo', conference: 'AFC', division: 'East', color: '#00338D', alt: '#D50A0A' },
  { id: '15', abbr: 'MIA', name: 'Miami Dolphins', city: 'Miami', conference: 'AFC', division: 'East', color: '#008E97', alt: '#FC4C02' },
  { id: '17', abbr: 'NE', name: 'New England Patriots', city: 'New England', conference: 'AFC', division: 'East', color: '#002A5C', alt: '#C60C30' },
  { id: '20', abbr: 'NYJ', name: 'New York Jets', city: 'New York', conference: 'AFC', division: 'East', color: '#115740', alt: '#FFFFFF' },
  { id: '33', abbr: 'BAL', name: 'Baltimore Ravens', city: 'Baltimore', conference: 'AFC', division: 'North', color: '#29126F', alt: '#000000' },
  { id: '4', abbr: 'CIN', name: 'Cincinnati Bengals', city: 'Cincinnati', conference: 'AFC', division: 'North', color: '#FB4F14', alt: '#000000' },
  { id: '5', abbr: 'CLE', name: 'Cleveland Browns', city: 'Cleveland', conference: 'AFC', division: 'North', color: '#472A08', alt: '#FF3C00' },
  { id: '23', abbr: 'PIT', name: 'Pittsburgh Steelers', city: 'Pittsburgh', conference: 'AFC', division: 'North', color: '#FFB612', alt: '#000000' },
  { id: '34', abbr: 'HOU', name: 'Houston Texans', city: 'Houston', conference: 'AFC', division: 'South', color: '#021018', alt: '#EB0028' },
  { id: '11', abbr: 'IND', name: 'Indianapolis Colts', city: 'Indianapolis', conference: 'AFC', division: 'South', color: '#003B75', alt: '#FFFFFF' },
  { id: '30', abbr: 'JAX', name: 'Jacksonville Jaguars', city: 'Jacksonville', conference: 'AFC', division: 'South', color: '#007487', alt: '#D7A22A' },
  { id: '10', abbr: 'TEN', name: 'Tennessee Titans', city: 'Tennessee', conference: 'AFC', division: 'South', color: '#4495D2', alt: '#001532' },
  { id: '7', abbr: 'DEN', name: 'Denver Broncos', city: 'Denver', conference: 'AFC', division: 'West', color: '#0A2343', alt: '#FC4C02' },
  { id: '12', abbr: 'KC', name: 'Kansas City Chiefs', city: 'Kansas City', conference: 'AFC', division: 'West', color: '#E31837', alt: '#FFB612' },
  { id: '13', abbr: 'LV', name: 'Las Vegas Raiders', city: 'Las Vegas', conference: 'AFC', division: 'West', color: '#A5ACAF', alt: '#000000' },
  { id: '24', abbr: 'LAC', name: 'Los Angeles Chargers', city: 'Los Angeles', conference: 'AFC', division: 'West', color: '#0080C6', alt: '#FFC20E' },
  { id: '6', abbr: 'DAL', name: 'Dallas Cowboys', city: 'Dallas', conference: 'NFC', division: 'East', color: '#002A5C', alt: '#B0B7BC' },
  { id: '19', abbr: 'NYG', name: 'New York Giants', city: 'New York', conference: 'NFC', division: 'East', color: '#003C7F', alt: '#C9243F' },
  { id: '21', abbr: 'PHI', name: 'Philadelphia Eagles', city: 'Philadelphia', conference: 'NFC', division: 'East', color: '#06424D', alt: '#A5ACAF' },
  { id: '28', abbr: 'WSH', name: 'Washington Commanders', city: 'Washington', conference: 'NFC', division: 'East', color: '#5A1414', alt: '#FFB612' },
  { id: '3', abbr: 'CHI', name: 'Chicago Bears', city: 'Chicago', conference: 'NFC', division: 'North', color: '#0B1C3A', alt: '#E64100' },
  { id: '8', abbr: 'DET', name: 'Detroit Lions', city: 'Detroit', conference: 'NFC', division: 'North', color: '#0076B6', alt: '#BBBBBB' },
  { id: '9', abbr: 'GB', name: 'Green Bay Packers', city: 'Green Bay', conference: 'NFC', division: 'North', color: '#204E32', alt: '#FFB612' },
  { id: '16', abbr: 'MIN', name: 'Minnesota Vikings', city: 'Minnesota', conference: 'NFC', division: 'North', color: '#4F2683', alt: '#FFC62F' },
  { id: '1', abbr: 'ATL', name: 'Atlanta Falcons', city: 'Atlanta', conference: 'NFC', division: 'South', color: '#A71930', alt: '#000000' },
  { id: '29', abbr: 'CAR', name: 'Carolina Panthers', city: 'Carolina', conference: 'NFC', division: 'South', color: '#0085CA', alt: '#000000' },
  { id: '18', abbr: 'NO', name: 'New Orleans Saints', city: 'New Orleans', conference: 'NFC', division: 'South', color: '#D3BC8D', alt: '#000000' },
  { id: '27', abbr: 'TB', name: 'Tampa Bay Buccaneers', city: 'Tampa Bay', conference: 'NFC', division: 'South', color: '#BD1C36', alt: '#3E3A35' },
  { id: '22', abbr: 'ARI', name: 'Arizona Cardinals', city: 'Arizona', conference: 'NFC', division: 'West', color: '#A40227', alt: '#FFFFFF' },
  { id: '14', abbr: 'LAR', name: 'Los Angeles Rams', city: 'Los Angeles', conference: 'NFC', division: 'West', color: '#003594', alt: '#FFD100' },
  { id: '25', abbr: 'SF', name: 'San Francisco 49ers', city: 'San Francisco', conference: 'NFC', division: 'West', color: '#AA0000', alt: '#B3995D' },
  { id: '26', abbr: 'SEA', name: 'Seattle Seahawks', city: 'Seattle', conference: 'NFC', division: 'West', color: '#002A5C', alt: '#69BE28' },
]
