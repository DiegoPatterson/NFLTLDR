import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { Text } from 'react-native'

import { ActionButton, Muted, Screen } from '@/src/components/shell'
import { TeamBrowser } from '@/src/components/teams'
import { copy } from '@/src/config/copy'
import { font, theme } from '@/src/config/theme'
import { getLeague } from '@/src/data/repository'
import type { CatalogTeam } from '@/src/data/types'
import { nflTeams } from '@/src/config/nflTeams'
import { useApp } from '@/src/state/AppState'

const fallback: CatalogTeam[] = nflTeams.map((team) => ({
  id: team.id,
  abbr: team.abbr,
  name: team.name,
  city: team.city,
  conference: team.conference,
  division: `${team.conference} ${team.division}`,
  color: team.color,
  alt: team.alt,
}))

export default function OnboardingScreen() {
  const { change } = useLocalSearchParams<{ change?: string }>()
  const { profile, setPrimaryTeam } = useApp()
  const [teams, setTeams] = useState<CatalogTeam[]>(fallback)
  const [selected, setSelected] = useState<string | null>(profile.primaryTeamId)

  useEffect(() => {
    getLeague()
      .then((result) => setTeams(result.data))
      .catch(() => undefined)
  }, [])

  return (
    <Screen
      title={brandlessTitle()}
      back={Boolean(change)}
      safeBottom
      dock={
        selected ? (
          <ActionButton
            label={change ? copy.updateTeam : copy.confirmTeam}
            onPress={() => {
              setPrimaryTeam(selected)
              if (change) router.back()
              else router.replace('/(tabs)/home')
            }}
          />
        ) : (
          <Muted>Tap a team, then confirm it here.</Muted>
        )
      }>
      <Text style={title}>{copy.pickTeam}</Text>
      <Muted>{copy.pickTeamHint}</Muted>
      <TeamBrowser teams={teams} selectedId={selected} yourId={profile.primaryTeamId} onPress={setSelected} />
    </Screen>
  )
}

function brandlessTitle() {
  return 'Your team'
}

const title = {
  color: theme.chalk,
  fontFamily: font.display,
  fontSize: 28,
  letterSpacing: 0.4,
}
