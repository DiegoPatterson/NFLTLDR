import { router, useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'

import { TeamDigest } from '@/src/components/digest'
import { ActionButton, Muted, Screen, updatedLabel } from '@/src/components/shell'
import { NewsTicker } from '@/src/components/ticker'
import { copy } from '@/src/config/copy'
import { getDigest, getNews } from '@/src/data/repository'
import type { Digest } from '@/src/data/types'
import { useApp } from '@/src/state/AppState'

export default function TeamScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { profile, setPrimaryTeam } = useApp()
  const [digest, setDigest] = useState<Digest | null>(null)
  const [ticker, setTicker] = useState<string[]>([])
  const [failed, setFailed] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(
    async (force = false) => {
      if (!id) return
      try {
        setDigest(await getDigest(id, force))
        setFailed(false)
      } catch {
        setFailed(true)
      }
    },
    [id],
  )

  useEffect(() => {
    load(false).catch(() => undefined)
    getNews()
      .then((result) => setTicker(result.data.filter((item) => item.big).map((item) => item.headline)))
      .catch(() => undefined)
  }, [load])

  const yours = id === profile.primaryTeamId

  return (
    <Screen
      back
      safeBottom
      title={digest?.abbr || 'Team'}
      banner={failed && !digest ? copy.failed : digest?.stale ? copy.stale : null}
      refreshing={refreshing}
      onRefresh={() => {
        setRefreshing(true)
        load(true)
          .catch(() => undefined)
          .finally(() => setRefreshing(false))
      }}
      footer={digest ? <Muted>{updatedLabel(digest.updatedAt)}</Muted> : null}>
      <NewsTicker items={ticker} />
      {!digest && !failed ? <Muted>{copy.checking}</Muted> : null}
      {digest ? <TeamDigest digest={digest} /> : null}
      {id ? (
        <ActionButton
          label={yours ? copy.alreadyYours : copy.setAsTeam}
          onPress={() => {
            if (yours) return
            setPrimaryTeam(id)
            router.replace('/(tabs)/home')
          }}
        />
      ) : null}
    </Screen>
  )
}
