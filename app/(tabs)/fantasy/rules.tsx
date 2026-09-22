import { Card, Muted, Screen, useTeamSkin } from '@/src/components/shell'
import { copy } from '@/src/config/copy'
import { presets } from '@/src/config/fantasyPresets'
import { font, theme } from '@/src/config/theme'
import { Text } from 'react-native'
import { useApp } from '@/src/state/AppState'

export default function RulesScreen() {
  const { profile } = useApp()
  const skin = useTeamSkin()
  return (
    <Screen back title={copy.rules}>
      <Muted>{copy.rulesIntro}</Muted>
      <Muted>
        {copy.currentSheet}: {profile.rules.name}
      </Muted>
      {presets.map((preset) => (
        <Card key={preset.id}>
          <Text style={name}>{preset.name}</Text>
          <Text style={[summary, { color: skin.accent }]}>{preset.summary}</Text>
          <Muted>{preset.body}</Muted>
        </Card>
      ))}
    </Screen>
  )
}

const name = { color: theme.chalk, fontFamily: font.display, fontSize: 22, letterSpacing: 0.6, textTransform: 'uppercase' as const }
const summary = { color: theme.gold, fontFamily: font.bodyMed, fontSize: 15 }
