import { aboutPlayer, clubSpans, injuriesByPlayer, playerNotes } from './playerFacts'

function assert(cond: boolean, label: string) {
  if (!cond) throw new Error(label)
}

const brady = {
  categories: [
    {
      statistics: [
        { teamId: '17', teamSlug: 'new-england-patriots', season: { year: 2000 } },
        { teamId: '17', teamSlug: 'new-england-patriots', season: { year: 2001 } },
        { teamId: '17', teamSlug: 'new-england-patriots', season: { year: 2002 } },
        { teamId: '27', teamSlug: 'tampa-bay-buccaneers', season: { year: 2020 } },
        { teamId: '27', teamSlug: 'tampa-bay-buccaneers', season: { year: 2021 } },
      ],
    },
  ],
}
const runs = clubSpans(brady)
assert(runs.length === 2, 'two clubs')
assert(runs[0].teamId === '17' && runs[0].from === 2000 && runs[0].to === 2002, 'pats years')
assert(runs[1].teamId === '27' && runs[1].from === 2020 && runs[1].to === 2021, 'bucs years')

const gap = clubSpans({
  categories: [
    {
      statistics: [
        { teamId: '1', teamSlug: 'a', season: { year: 2018 } },
        { teamId: '2', teamSlug: 'b', season: { year: 2019 } },
        { teamId: '1', teamSlug: 'a', season: { year: 2021 } },
      ],
    },
  ],
})
assert(gap.length === 3 && gap[2].from === 2021, 'a return is its own run')

assert(aboutPlayer('Travis Kelce tells SVP', 'Travis', 'Kelce', 'Travis Kelce'), 'full name')
assert(aboutPlayer('Mahomes fires to Kelce for a score', 'Travis', 'Kelce', 'Travis Kelce'), 'bare last name')
assert(!aboutPlayer('Jason Kelce finds out', 'Travis', 'Kelce', 'Travis Kelce'), 'other first name')

const notes = playerNotes(
  [
    { headline: 'Jason Kelce finds out', description: 'His brother is back in Philly' },
    { headline: 'Travis Kelce tells SVP how the Chiefs prevailed', description: 'A football note' },
    { headline: 'Travis Kelce purchased a house', description: 'Off the field' },
  ],
  { first: 'Travis', last: 'Kelce', full: 'Travis Kelce' },
)
assert(notes.length === 1 && notes[0].headline.includes('Chiefs'), 'football note only')

const report = injuriesByPlayer({
  injuries: [
    {
      injuries: [
        {
          status: 'Active',
          athlete: { links: [{ href: 'https://www.espn.com/nfl/player/_/id/1/somebody' }] },
          details: { type: 'Knee' },
        },
        {
          status: 'Questionable',
          shortComment: 'questionable',
          longComment: 'Questionable with a toe injury heading into the week.',
          athlete: { links: [{ href: 'https://www.espn.com/nfl/player/_/id/99/melton' }] },
          details: { type: 'Toe', side: 'Left', detail: 'Not Specified' },
        },
      ],
    },
  ],
})
assert(!report['1'], 'active is not an injury')
assert(report['99'].line === 'Questionable · Left toe', 'body part')
assert(report['99'].note.includes('toe'), 'note kept')

console.log('player facts ok')
