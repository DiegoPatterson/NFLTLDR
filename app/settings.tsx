import { router } from 'expo-router'
import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'

import { ActionButton, Card, Muted, Screen, useAccent } from '@/src/components/shell'
import { brand } from '@/src/config/brand'
import { copy } from '@/src/config/copy'
import { font, theme } from '@/src/config/theme'
import { clearCache } from '@/src/data/cache'
import { nflTeams } from '@/src/config/nflTeams'
import { useApp } from '@/src/state/AppState'

export default function SettingsScreen() {
  const { profile, setUseTeamColors } = useApp()
  const { accent, accentInk } = useAccent()
  const [note, setNote] = useState<string | null>(null)
  const team = nflTeams.find((item) => item.id === profile.primaryTeamId)

  return (
    <Screen title={copy.settings} back safeBottom>
      <Card>
        <Text style={label}>{copy.yourTeam}</Text>
        <Text style={value}>{team?.name ?? 'None yet'}</Text>
        <ActionButton label={copy.changeTeam} onPress={() => router.push('/onboarding?change=1')} />
        <View style={toggleRow}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={label}>{copy.teamColors}</Text>
            <Muted>{copy.teamColorsHint}</Muted>
          </View>
          <Pressable
            onPress={() => setUseTeamColors(!profile.useTeamColors)}
            accessibilityRole="switch"
            accessibilityState={{ checked: profile.useTeamColors }}
            style={[toggle, { backgroundColor: profile.useTeamColors ? accent : theme.card2 }]}>
            <Text style={[toggleText, { color: profile.useTeamColors ? accentInk : theme.chalk }]}>
              {profile.useTeamColors ? copy.on : copy.off}
            </Text>
          </Pressable>
        </View>
      </Card>
      <Card>
        <Text style={label}>{copy.creditsTitle}</Text>
        <Muted>{copy.credits}</Muted>
      </Card>
      <Card>
        <Text style={label}>{brand.name}</Text>
        <Muted>{copy.editHint}</Muted>
        <ActionButton
          label={copy.clearCache}
          onPress={() => {
            clearCache()
              .then(() => setNote(copy.cacheCleared))
              .catch(() => undefined)
          }}
        />
        {note ? <Muted>{note}</Muted> : null}
      </Card>
    </Screen>
  )
}

const label = {
  color: theme.faint,
  fontFamily: font.display,
  letterSpacing: 1,
  textTransform: 'uppercase' as const,
  fontSize: 13,
}
const value = { color: theme.chalk, fontFamily: font.display, fontSize: 24 }
const toggleRow = { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 12 }
const toggle = { borderRadius: 6, paddingHorizontal: 12, paddingVertical: 8 }
const toggleText = { fontFamily: font.display, letterSpacing: 1, textTransform: 'uppercase' as const, fontSize: 14 }
