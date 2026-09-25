import { router } from 'expo-router'
import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'

import { Card, Logo, Muted, useTeamSkin } from '@/src/components/shell'
import { copy } from '@/src/config/copy'
import { font, theme } from '@/src/config/theme'
import type { SlateGame } from '@/src/data/types'
import { playoffPicture, roundLabel, type PlayoffSide, type PlayoffTeam } from '@/src/logic/playoff'

export function PlayoffPicture({ rows, games }: { rows: Parameters<typeof playoffPicture>[0]; games: SlateGame[] }) {
  const skin = useTeamSkin()
  const [open, setOpen] = useState(false)
  const sides = playoffPicture(rows)
  if (!sides.length && !games.length) return null
  const rounds = groupRounds(games)
  return (
    <Card>
      <Pressable onPress={() => setOpen((value) => !value)} accessibilityRole="button">
        <Text style={[section, { color: skin.accent }]}>
          {copy.playoffPicture}  {open ? '–' : '+'}
        </Text>
      </Pressable>
      {open ? (
        <View style={{ gap: 12 }}>
          <Muted>{games.length ? copy.playoffLiveNote : copy.playoffNote}</Muted>
          {sides.map((side) => (
            <Conference key={side.conference} side={side} showPairings={!games.length} />
          ))}
          {rounds.map((round) => (
            <View key={round.label} style={{ gap: 6 }}>
              <Text style={[group, { color: skin.accent }]}>{round.label}</Text>
              {round.games.map((game) => (
                <Pressable key={game.id} onPress={() => router.push(`/game/${game.id}`)} accessibilityRole="button">
                  <Text style={nameText}>
                    {game.away.abbr} {game.away.score} at {game.home.abbr} {game.home.score}
                    {game.state === 'pre' ? `  ·  ${game.detail}` : ''}
                  </Text>
                </Pressable>
              ))}
            </View>
          ))}
        </View>
      ) : null}
    </Card>
  )
}

function Conference({ side, showPairings }: { side: PlayoffSide; showPairings: boolean }) {
  const skin = useTeamSkin()
  const bye = side.field.find((team) => team.seed === 1)
  return (
    <View style={{ gap: 6 }}>
      <Text style={[group, { color: skin.accent }]}>{side.conference}</Text>
      {side.field.map((team) => (
        <Seed key={team.id} team={team} tag={team.seed === 1 ? copy.playoffBye : team.seed <= 4 ? copy.playoffDivision : copy.playoffWild} />
      ))}
      {showPairings && side.wildCard.length ? (
        <View style={{ gap: 2 }}>
          <Text style={hint}>{copy.playoffIfEnded}</Text>
          {bye ? <Text style={hint}>{bye.abbr} would sit the first weekend.</Text> : null}
          {side.wildCard.map((pair) => (
            <Text key={`${pair.home.id}-${pair.away.id}`} style={nameText}>
              {pair.away.abbr} at {pair.home.abbr}
            </Text>
          ))}
        </View>
      ) : null}
      {side.outside.length ? (
        <View style={{ gap: 4 }}>
          <Text style={hint}>{copy.playoffOut}</Text>
          {side.outside.map((team) => (
            <Seed key={team.id} team={team} />
          ))}
        </View>
      ) : null}
    </View>
  )
}

function Seed({ team, tag }: { team: PlayoffTeam; tag?: string }) {
  return (
    <Pressable onPress={() => router.push(`/team/${team.id}`)} style={seedRow} accessibilityRole="button">
      <Text style={seedNum}>{team.seed}</Text>
      <Logo abbr={team.abbr} size={22} />
      <Text style={seedName}>{team.abbr}</Text>
      <Text style={record}>{team.record}</Text>
      {tag ? <Text style={hint}>{tag}</Text> : null}
    </Pressable>
  )
}

function groupRounds(games: SlateGame[]) {
  const order: string[] = []
  const buckets = new Map<string, SlateGame[]>()
  for (const game of games) {
    const label = roundLabel(game)
    if (!buckets.has(label)) {
      buckets.set(label, [])
      order.push(label)
    }
    buckets.get(label)?.push(game)
  }
  return order.map((label) => ({ label, games: buckets.get(label) ?? [] }))
}

const section = { fontFamily: font.display, fontSize: 18, letterSpacing: 0.8, textTransform: 'uppercase' as const }
const group = { fontFamily: font.display, fontSize: 14, letterSpacing: 1, textTransform: 'uppercase' as const }
const seedRow = { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8 }
const seedNum = { width: 18, color: theme.chalk, fontFamily: font.display, fontSize: 16 }
const nameText = { color: theme.chalk, fontFamily: font.bodyMed, fontSize: 15 }
const seedName = { flex: 1, color: theme.chalk, fontFamily: font.bodyMed, fontSize: 15 }
const record = { color: theme.chalk, fontFamily: font.body, fontSize: 14 }
const hint = { color: theme.muted, fontFamily: font.body, fontSize: 13 }
