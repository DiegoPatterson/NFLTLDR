import { router } from 'expo-router'
import { Pressable, Share, Text, View } from 'react-native'

import { Card, Muted, Screen, useTeamSkin } from '@/src/components/shell'
import { brand } from '@/src/config/brand'
import { copy } from '@/src/config/copy'
import { features } from '@/src/config/features'
import { font, theme } from '@/src/config/theme'
import { useApp } from '@/src/state/AppState'

const links = [
  { href: '/fantasy/rules' as const, title: copy.rules, dek: 'Standard, half PPR, and PPR in plain language.' },
  { href: '/fantasy/sheet' as const, title: copy.customSheet, dek: 'Scoring, roster slots, and house notes.' },
  { href: '/fantasy/punishments' as const, title: copy.punishments, dek: 'Who owes what, and whether they paid up.' },
  { href: '/fantasy/roster' as const, title: copy.roster, dek: copy.rosterDek },
]

export default function FantasyHome() {
  const { profile } = useApp()
  const skin = useTeamSkin()
  const rowStyle = [row, { backgroundColor: skin.card, borderColor: skin.line }]
  return (
    <Screen gear title={copy.fantasy}>
      <Text style={title}>{copy.fantasyTitle}</Text>
      <Muted>{copy.fantasyIntro}</Muted>
      <Card>
        <Text style={kicker}>{copy.currentSheet}</Text>
        <Text style={[sheet, { color: skin.accent }]}>{profile.rules.name}</Text>
        <Muted>{copy.savedHere}</Muted>
      </Card>
      {links.map((link) => (
        <Pressable key={link.href} onPress={() => router.push(link.href)} style={rowStyle}>
          <Text style={rowTitle}>{link.title}</Text>
          <Text style={rowDek}>{link.dek}</Text>
        </Pressable>
      ))}
      {features.exportFantasy ? (
        <Pressable
          onPress={() => {
            const message = JSON.stringify(
              { rules: profile.rules, punishments: profile.punishments, roster: profile.roster },
              null,
              2,
            )
            Share.share({ message, title: `${brand.name} sheet` }).catch(() => undefined)
          }}
          style={rowStyle}>
          <Text style={rowTitle}>{copy.exportSheet}</Text>
          <Text style={rowDek}>{copy.exportHint}</Text>
        </Pressable>
      ) : null}
    </Screen>
  )
}

const title = { color: theme.chalk, fontFamily: font.display, fontSize: 28 }
const kicker = { color: theme.faint, fontFamily: font.display, letterSpacing: 1, textTransform: 'uppercase' as const, fontSize: 12 }
const sheet = { color: theme.gold, fontFamily: font.display, fontSize: 22 }
const row = {
  backgroundColor: theme.card,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: theme.lineSoft,
  padding: 14,
  gap: 4,
}
const rowTitle = { color: theme.chalk, fontFamily: font.display, fontSize: 18, letterSpacing: 0.6, textTransform: 'uppercase' as const }
const rowDek = { color: theme.muted, fontFamily: font.body, fontSize: 14 }
