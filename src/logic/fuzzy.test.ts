import { fuzzyScore } from './fuzzy'

function assert(cond: boolean, label: string) {
  if (!cond) throw new Error(label)
}

assert(fuzzyScore('chiefs', 'Kansas City Chiefs') >= 60, 'chiefs')
assert(fuzzyScore('cheifs', 'Kansas City Chiefs') >= 60, 'cheifs typo')
assert(fuzzyScore('dolphines', 'Miami Dolphins') >= 60, 'dolphines')
assert(fuzzyScore('mahommes', 'Patrick Mahomes') >= 60, 'mahommes')
assert(fuzzyScore('patrik mahomes', 'Patrick Mahomes') >= 60, 'patrik mahomes')
assert(fuzzyScore('kc', 'KC') === 100, 'abbr')
assert(fuzzyScore('zzzz', 'Kansas City Chiefs') === 0, 'nonsense')

console.log('fuzzy ok')
