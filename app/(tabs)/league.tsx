import { router } from 'expo-router'
import { Pressable, Text } from 'react-native'
import { useCallback, useEffect, useState } from 'react'

import { Muted, Screen, updatedLabel, useTeamSkin } from '@/src/components/shell'
import { TeamBrowser } from '@/src/components/teams'
import { copy } from '@/src/config/copy'
import { font } from '@/src/config/theme'
import { getLeague } from '@/src/data/repository'
import type { CatalogTeam } from '@/src/data/types'
import { useApp } from '@/src/state/AppState'

export default function LeagueScreen() {
  const { profile } = useApp()
  const skin = useTeamSkin()
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
      <Pressable
        onPress={() => router.push('/rules')}
        accessibilityRole="button"
        style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingVertical: 4 }}>
        <Text style={{ color: skin.accent, fontFamily: font.display, fontSize: 16, letterSpacing: 0.8 }}>{copy.nflRules}</Text>
        <Text style={{ color: skin.faint, fontFamily: font.body, fontSize: 13 }}>{copy.nflRulesHint}</Text>
      </Pressable>
      {!teams.length && !failed ? <Muted>{copy.checking}</Muted> : null}
      <TeamBrowser teams={teams} yourId={profile.primaryTeamId} onPress={(id) => router.push(`/team/${id}`)} />
    </Screen>
  )
}
