import { router, type Href } from 'expo-router'
import { useEffect, useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'

import { Logo, Muted, Screen, useTeamSkin } from '@/src/components/shell'
import { copy } from '@/src/config/copy'
import { font, theme } from '@/src/config/theme'
import { getLeague, loadPlayer, searchPlayers } from '@/src/data/repository'
import type { CatalogTeam, PlayerHit } from '@/src/data/types'
import { useApp } from '@/src/state/AppState'

export default function WatchScreen() {
  const { profile, watchTeam, unwatchTeam, unwatchPlayer, watchPlayer } = useApp()
  const skin = useTeamSkin()
  const [teams, setTeams] = useState<CatalogTeam[]>([])
  const [addingTeam, setAddingTeam] = useState(false)
  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<PlayerHit[]>([])
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    getLeague()
      .then((result) => setTeams(result.data))
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    let cancel = false
    Promise.all(
      profile.watchedPlayers.map((player) =>
        loadPlayer({ id: player.id, name: player.name, teamName: player.teamAbbr }).catch(() => player),
      ),
    ).then((cards) => {
      if (cancel) return
      cards.forEach((card) => {
        if (card.active) watchPlayer(card)
      })
    })
    return () => {
      cancel = true
    }
    // Refresh saved stat lines when this screen opens. watchPlayer identity changes too often to list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const watchedTeams = teams.filter((team) => profile.watchedTeamIds.includes(team.id))

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

  return (
    <Screen gear title={copy.watch}>
      <Muted>{copy.watchIntro}</Muted>
      <Text style={[heading, { color: skin.accent }]}>{copy.watchedTeams}</Text>
      {!watchedTeams.length ? <Muted>{copy.noWatchTeams}</Muted> : null}
      {watchedTeams.map((team) => (
        <View key={team.id} style={[row, { backgroundColor: skin.card, borderColor: skin.line }]}>
          <Pressable style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }} onPress={() => router.push(`/team/${team.id}`)}>
            <Logo abbr={team.abbr} size={36} />
            <View style={{ flex: 1 }}>
              <Text style={name}>{team.name}</Text>
              <Text style={sub}>{team.record || team.division}</Text>
            </View>
          </Pressable>
          <Pressable onPress={() => unwatchTeam(team.id)} accessibilityRole="button">
            <Text style={[action, { color: skin.accent }]}>{copy.unwatch}</Text>
          </Pressable>
        </View>
      ))}
      <Pressable onPress={() => setAddingTeam((value) => !value)} accessibilityRole="button">
        <Text style={[action, { color: skin.accent }]}>{copy.addWatchTeam}</Text>
      </Pressable>
      {addingTeam
        ? teams.map((team) => {
            const on = profile.watchedTeamIds.includes(team.id)
            return (
              <Pressable key={team.id} onPress={() => (on ? unwatchTeam(team.id) : watchTeam(team.id))} style={mini}>
                <Text style={{ color: on ? skin.accent : theme.chalk, fontFamily: font.body }}>{team.abbr}</Text>
              </Pressable>
            )
          })
        : null}

      <Text style={[heading, { color: skin.accent }]}>{copy.watchedPlayers}</Text>
      {!profile.watchedPlayers.length ? <Muted>{copy.noWatchPlayers}</Muted> : null}
      {profile.watchedPlayers.map((player) => (
        <View key={player.id} style={[row, { backgroundColor: skin.card, borderColor: skin.line }]}>
          <Pressable style={{ flex: 1 }} onPress={() => router.push(`/player/${player.id}` as Href)}>
            <Text style={name}>
              {player.name} {player.position} {player.teamAbbr}
            </Text>
          </Pressable>
          <Pressable onPress={() => unwatchPlayer(player.id)} accessibilityRole="button">
            <Text style={[action, { color: skin.accent }]}>{copy.unwatch}</Text>
          </Pressable>
        </View>
      ))}

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder={copy.playerTitle}
        placeholderTextColor={theme.faint}
        style={[input, { backgroundColor: skin.card, borderColor: skin.line }]}
        onSubmitEditing={() => find().catch(() => undefined)}
      />
      {status ? <Muted>{status}</Muted> : null}
      {hits.map((hit) => (
        <Pressable key={hit.id} onPress={() => router.push(`/player/${hit.id}` as Href)} style={mini}>
          <Text style={name}>{hit.name}</Text>
          <Text style={sub}>{hit.teamName}</Text>
        </Pressable>
      ))}
    </Screen>
  )
}

const heading = { fontFamily: font.display, fontSize: 18, letterSpacing: 1, textTransform: 'uppercase' as const }
const row = { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 10, borderWidth: 1, borderRadius: 10, padding: 10 }
const name = { color: theme.chalk, fontFamily: font.bodyMed, fontSize: 16 }
const sub = { color: theme.muted, fontFamily: font.body, fontSize: 13 }
const action = { fontFamily: font.display, fontSize: 13, letterSpacing: 0.6, textTransform: 'uppercase' as const }
const mini = { paddingVertical: 8 }
const input = {
  color: theme.chalk,
  fontFamily: font.body,
  fontSize: 16,
  borderWidth: 1,
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 10,
}
