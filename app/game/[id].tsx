import { useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'

import { LiveBoard } from '@/src/components/board'
import { useScreenAwake } from '@/src/components/useScreenAwake'
import { Muted, Screen, updatedLabel } from '@/src/components/shell'
import { copy } from '@/src/config/copy'
import { features } from '@/src/config/features'
import { getGameDetail } from '@/src/data/repository'
import type { GameDetail } from '@/src/data/types'

export default function GameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [detail, setDetail] = useState<GameDetail | null>(null)
  const [failed, setFailed] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const awake = useScreenAwake()
  const load = useCallback(
    async (force = false, persist = true) => {
      if (!id) return
      try {
        setDetail(await getGameDetail(id, force, persist))
        setFailed(false)
      } catch {
        setFailed(true)
      }
    },
    [id],
  )

  useEffect(() => {
    load(false).catch(() => undefined)
  }, [load])

  useEffect(() => {
    if (!awake || detail?.game.state !== 'in') return
    const timer = setInterval(() => {
      load(true, false).catch(() => undefined)
    }, features.liveRefreshMs)
    return () => clearInterval(timer)
  }, [awake, detail?.game.state, load])

  return (
    <Screen
      back
      safeBottom
      title={detail?.game.shortName || 'Game'}
      banner={failed && !detail ? copy.failed : detail?.stale ? copy.stale : null}
      refreshing={refreshing}
      onRefresh={() => {
        setRefreshing(true)
        load(true)
          .catch(() => undefined)
          .finally(() => setRefreshing(false))
      }}
      footer={detail ? <Muted>{updatedLabel(detail.updatedAt)}</Muted> : null}>
      {!detail && !failed ? <Muted>{copy.checking}</Muted> : null}
      {detail ? <LiveBoard detail={detail} /> : null}
      {detail?.injuries.length ? (
        <Muted>
          {detail.injuries
            .slice(0, 8)
            .map((person) => `${person.status}: ${person.name}${person.teamAbbr ? ` (${person.teamAbbr})` : ''}`)
            .join('\n')}
        </Muted>
      ) : null}
    </Screen>
  )
}
