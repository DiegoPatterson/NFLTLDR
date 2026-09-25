import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'

import { useTeamSkin } from '@/src/components/shell'
import { copy } from '@/src/config/copy'
import { font, theme } from '@/src/config/theme'
import type { SlateGame } from '@/src/data/types'

/** Other outlets, under the rest of the card. Live stations are not links. */
export function OtherOutlets({ game }: { game: SlateGame }) {
  const skin = useTeamSkin()
  const [open, setOpen] = useState(false)
  const rest = (game.outlets ?? []).filter((outlet) => outlet.label !== game.broadcast)
  if (!rest.length) return null
  return (
    <View style={{ gap: 4 }}>
      <Pressable onPress={() => setOpen((value) => !value)} accessibilityRole="button">
        <Text style={[toggle, { color: skin.accent }]}>
          {copy.otherStations}  {open ? '–' : '+'}
        </Text>
      </Pressable>
      {open
        ? rest.map((outlet) => (
            <Text key={outlet.label} style={row}>
              {outlet.label}
            </Text>
          ))
        : null}
    </View>
  )
}

const toggle = { fontFamily: font.display, fontSize: 13, letterSpacing: 0.6, textTransform: 'uppercase' as const }
const row = { color: theme.chalk, fontFamily: font.body, fontSize: 15 }