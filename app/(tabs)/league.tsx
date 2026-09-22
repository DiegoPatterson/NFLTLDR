import { router } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'

import { Screen, updatedLabel, Muted } from '@/src/components/shell'
import { TeamBrowser } from '@/src/components/teams'
import { copy } from '@/src/config/copy'
import { getLeague } from '@/src/data/repository'
import type { CatalogTeam } from '@/src/data/types'
import { useApp } from '@/src/state/AppState'

export default function LeagueScreen() {
  const { profile } = useApp()
  const [teams, setTeams] = useState<CatalogTeam[]>([])
  const [stale, setStale] = useState(false)
  const [failed, setFailed] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [updatedAt, setUpdatedAt] = useState<number | undefined>(undefined)

  const load = useCallback(async (force = false) => {
    try {
      const result = await getLeague(force)
      setTeams(result.data)
      setUpdatedAt(result.at)
      setStale(result.stale)
      setFailed(false)
    } catch {
      setFailed(true)
    }
  }, [])

  useEffect(() => {
    load(false).catch(() => undefined)
  }, [load])

  return (
    <Screen
      gear
      title={copy.league}
      banner={failed && !teams.length ? copy.failed : stale ? copy.stale : null}
      refreshing={refreshing}
      onRefresh={() => {
        setRefreshing(true)
        load(true)
          .catch(() => undefined)
          .finally(() => setRefreshing(false))
      }}
      footer={updatedAt ? <Muted>{updatedLabel(updatedAt)}</Muted> : null}>
      {!teams.length && !failed ? <Muted>{copy.checking}</Muted> : null}
      <TeamBrowser teams={teams} yourId={profile.primaryTeamId} onPress={(id) => router.push(`/team/${id}`)} />
    </Screen>
  )
}
