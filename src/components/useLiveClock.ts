import { useEffect, useState } from 'react'

import { useScreenAwake } from '@/src/components/useScreenAwake'
import type { SlateGame } from '@/src/data/types'
import { liveClockText, parseClock } from '@/src/logic/liveClock'

/**
 * Counts the game clock down between scoreboard checks.
 * `stamp` is the time that check arrived. When it changes, the clock snaps
 * back to whatever the feed says, even if our count has drifted.
 */
export function useLiveClock(game: SlateGame | null | undefined, stamp?: number): string {
  const awake = useScreenAwake()
  const clock = game?.state === 'in' ? game.clock : undefined
  const token = `${stamp ?? ''}|${clock ?? ''}|${game?.clockRunning === false ? 'stop' : 'run'}`
  const [seen, setSeen] = useState(token)
  const [left, setLeft] = useState<number | null>(() => (clock ? parseClock(clock) : null))
  if (token !== seen) {
    setSeen(token)
    setLeft(clock ? parseClock(clock) : null)
  }
  const running = awake && !!clock && game?.clockRunning !== false && (left ?? 0) > 0
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      setLeft((value) => (value == null || value <= 0 ? value : value - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [running, token])
  if (!game) return ''
  if (game.state !== 'in') return game.detail
  return liveClockText(game.detail, left)
}
