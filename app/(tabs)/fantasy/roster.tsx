import { router, type Href } from 'expo-router'
import { useState } from 'react'
import { Image, Pressable, Text, TextInput, View } from 'react-native'

import { ActionButton, Card, Muted, Screen, useAccent, useTeamSkin } from '@/src/components/shell'
import { copy } from '@/src/config/copy'
import { nflTeams } from '@/src/config/nflTeams'
import { features } from '@/src/config/features'
import { glossary, playerLine, playerLineDefault, statGlossary, statLabels } from '@/src/config/statCatalog'
import { font, theme } from '@/src/config/theme'
import { loadPlayer, searchPlayers } from '@/src/data/repository'
import type { PlayerCard, PlayerHit } from '@/src/data/types'
import { slotLabel, slotOrder } from '@/src/logic/lineup'
import { estimatePoints, formatPoints, glance } from '@/src/logic/points'
import { useApp } from '@/src/state/AppState'

export default function RosterScreen() {
  const { profile, addPlayer, removePlayer } = useApp()
  const skin = useTeamSkin()
  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<PlayerHit[]>([])
  const [status, setStatus] = useState<string | null>(null)
  const [left, setLeft] = useState<string | null>(null)
  const [right, setRight] = useState<string | null>(null)
  const [showDefense, setShowDefense] = useState(false)

  async function find() {
    if (query.trim().length < 2) {
      setStatus(copy.searchHint)
      return
    }
    setStatus(copy.checking)
    try {
      const found = await searchPlayers(query.trim())
      setHits(found)
      setStatus(found.length ? null : copy.noPlayers)
    } catch {
      setStatus(copy.failed)
    }
  }

  async function add(hit: PlayerHit) {
    setStatus(copy.adding)
    try {
      const card = await loadPlayer(hit)
      if (!card.active) {
        setStatus(copy.notActive)
        return
      }
      const problem = addPlayer(card)
      setStatus(problem ?? (Object.keys(card.stats).length ? null : copy.statMiss))
    } catch {
      setStatus(copy.failed)
    }
  }

  function addDefense(abbr: string, name: string) {
    const problem = addPlayer({
      id: `dst:${abbr}`,
      name: `${name} DST`,
      teamAbbr: abbr,
      position: 'DST',
      active: true,
      stats: {},
      numbers: {},
    })
    setStatus(problem)
    if (!problem) setShowDefense(false)
  }

  const a = profile.roster.find((player) => player.id === left)
  const b = profile.roster.find((player) => player.id === right)

  return (
    <Screen back title={copy.roster}>
      <Muted>{copy.searchHint}</Muted>
      <View style={searchRow}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Josh Allen"
          placeholderTextColor={theme.faint}
          style={[input, { backgroundColor: skin.card, borderColor: skin.line }]}
          autoCorrect={false}
          onSubmitEditing={() => find().catch(() => undefined)}
        />
        <ActionButton label={copy.findPlayer} onPress={() => find().catch(() => undefined)} />
      </View>
      {status ? <Muted>{status}</Muted> : null}
      {hits.map((hit) => (
        <Pressable key={hit.id} onPress={() => add(hit).catch(() => undefined)} style={[hitRow, { borderBottomColor: skin.line }]}>
          {hit.headshot ? <Image source={{ uri: hit.headshot }} style={head} /> : <View style={head} />}
          <View style={{ flex: 1 }}>
            <Text style={hitName}>{hit.name}</Text>
            <Text style={hitTeam}>{hit.teamName}</Text>
          </View>
          <Text style={[addMark, { color: skin.accent }]}>Add</Text>
        </Pressable>
      ))}

      <Pressable onPress={() => setShowDefense((value) => !value)} accessibilityRole="button">
        <Text style={[addMark, { color: skin.accent }]}>{copy.addDefense}</Text>
      </Pressable>
      {showDefense ? (
        <View style={pair}>
          {nflTeams.map((team) => (
            <Pressable key={team.abbr} onPress={() => addDefense(team.abbr, team.name)} style={[pick, { borderColor: skin.line }]}>
              <Text style={pickText}>{team.abbr}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {slotOrder.map((slot) => {
        const cap = profile.rules.slots[slot]
        if (!cap) return null
        const filled = profile.roster.filter((player) => player.slot === slot)
        const open = cap - filled.length
        return (
          <View key={slot} style={{ gap: 6 }}>
            <Text style={section}>
              {slotLabel[slot]} {filled.length}/{cap}
            </Text>
            {filled.map((player) => {
              const estimate = estimatePoints(player.numbers, profile.rules.scoring)
              return (
                <Card key={player.id}>
                  <Pressable onPress={() => (player.position === 'DST' ? undefined : router.push(`/player/${player.id}` as Href))}>
                    <Text style={hitName}>
                      {player.name} {player.position && player.position !== 'DST' ? `· ${player.position}` : ''} {player.teamAbbr}
                    </Text>
                    <Text style={line}>{statLine(player, 'main') || '—'}</Text>
                  </Pressable>
                  {estimate.counted ? (
                    <Text style={[points, { color: skin.accent }]}>
                      {copy.pointsLabel} {formatPoints(estimate.points)}
                    </Text>
                  ) : null}
                  <Pressable onPress={() => removePlayer(player.id)} accessibilityRole="button">
                    <Text style={remove}>{copy.remove}</Text>
                  </Pressable>
                </Card>
              )
            })}
            {Array.from({ length: open }, (_, index) => (
              <Text key={`${slot}-open-${index}`} style={line}>
                {copy.openSlot} {slotLabel[slot]}
              </Text>
            ))}
          </View>
        )
      })}
      <Muted>{copy.pointsHint}</Muted>

      {features.startSit ? (
        <Card>
          <Text style={section}>{copy.glance}</Text>
          <Muted>{copy.glancePick}</Muted>
          {profile.roster.length < 2 ? <Muted>{copy.needTwo}</Muted> : null}
          <View style={pair}>
            {profile.roster.map((player) => (
              <Pick
                key={player.id}
                label={`${player.name}${player.position ? ` ${player.position}` : ''}`}
                on={left === player.id || right === player.id}
                onPress={() => {
                  if (left === player.id) setLeft(null)
                  else if (right === player.id) setRight(null)
                  else if (!left) setLeft(player.id)
                  else setRight(player.id)
                }}
              />
            ))}
          </View>
          {a && b ? <Text style={glanceText}>{glance(a, b)}</Text> : null}
        </Card>
      ) : null}
    </Screen>
  )
}

function statLine(player: PlayerCard, which: 'main' | 'more'): string {
  const spec = playerLine[player.position] ?? playerLineDefault
  const parts: string[] = []
  const names = spec[which]
  if (which === 'main' && player.stats.completions && player.stats.passingAttempts) {
    parts.push(`CMP/ATT ${player.stats.completions}/${player.stats.passingAttempts}`)
  }
  for (const name of names) {
    if (name === 'completions' || name === 'passingAttempts') continue
    const value = player.stats[name]
    if (!value) continue
    const glossId = statGlossary[name]
    const label = statLabels[name] ?? name
    parts.push(glossId && glossary[glossId] ? `${label} ${value}` : `${label} ${value}`)
  }
  return parts.join('   ')
}

function Pick({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  const { accent, accentInk } = useAccent()
  const skin = useTeamSkin()
  return (
    <Pressable onPress={onPress} style={[pick, { borderColor: skin.line }, on && { backgroundColor: accent }]}>
      <Text style={[pickText, on && { color: accentInk }]}>{label}</Text>
    </Pressable>
  )
}

const searchRow = { gap: 8 }
const input = {
  color: theme.chalk,
  fontFamily: font.body,
  fontSize: 16,
  backgroundColor: theme.card,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: theme.lineSoft,
  paddingHorizontal: 12,
  paddingVertical: 10,
}
const hitRow = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  gap: 10,
  padding: 8,
  borderBottomWidth: 1,
  borderBottomColor: theme.lineSoft,
}
const head = { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.card2 }
const hitName = { color: theme.chalk, fontFamily: font.bodyMed, fontSize: 16 }
const hitTeam = { color: theme.faint, fontFamily: font.body, fontSize: 12 }
const addMark = { color: theme.gold, fontFamily: font.display, letterSpacing: 0.8 }
const line = { color: theme.muted, fontFamily: font.body, fontSize: 13, marginTop: 2 }
const identity = { flexDirection: 'row' as const, gap: 10, alignItems: 'center' as const }
const points = { color: theme.gold, fontFamily: font.display, fontSize: 18 }
const remove = { color: theme.faint, fontFamily: font.display, letterSpacing: 0.8, textTransform: 'uppercase' as const }
const section = { color: theme.chalk, fontFamily: font.display, fontSize: 18, letterSpacing: 0.8, textTransform: 'uppercase' as const }
const pair = { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 8 }
const pick = { borderWidth: 1, borderColor: theme.lineSoft, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 6 }
const pickText = { color: theme.chalk, fontFamily: font.body, fontSize: 13 }
const glanceText = { color: theme.chalk, fontFamily: font.body, fontSize: 15, lineHeight: 21 }
