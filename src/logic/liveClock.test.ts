import { clockFromDetail, formatClock, liveClockText, parseClock, periodLabel } from './liveClock'

function assert(cond: boolean, label: string) {
  if (!cond) throw new Error(label)
}

assert(parseClock('8:42') === 522, 'parse')
assert(parseClock('0:00') === 0, 'zero')
assert(parseClock('1:00 PM') === null, 'kickoff is not a game clock')
assert(formatClock(522) === '8:42', 'format')
assert(formatClock(5) === '0:05', 'pad')
assert(periodLabel('2nd 8:42') === '2nd', 'period')
assert(periodLabel('OT 1:02') === 'OT', 'ot')
assert(periodLabel('Halftime') === '', 'no period')
assert(clockFromDetail('2nd 8:42', '') === '8:42', 'clock from the line')
assert(clockFromDetail('9/27 - 1:00 PM EDT', '') === '', 'kickoff ignored')
assert(liveClockText('2nd 8:42', 521) === '2nd 8:41', 'tick')
assert(liveClockText('Halftime', null) === 'Halftime', 'leave a stopped label')

console.log('live clock ok')
