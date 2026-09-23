import { router, type Href } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { Pressable, Text, View } from 'react-native'

import { Logo, Muted, Screen, updatedLabel, useTeamSkin } from '@/src/components/shell'
import { TeamBrowser } from '@/src/components/teams'
import { copy } from '@/src/config/copy'
import { font, theme } from '@/src/config/theme'
import { getLeague, searchPlayers } from '@/src/data/repository'
import type { CatalogTeam, PlayerCard, PlayerHit } from '@/src/data/types'
import { useApp } from '@/src/state/AppState'

export default function LeagueScreen() {
  const { profile, watchPlayer, unwatchPlayer } = useApp()
  const skin = useTeamSkin()
  const [teams, setTeams] = useState<CatalogTeam[]>([])
  const [stale, setStale] = useState(false)
  const [failed, setFailed] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [updatedAt, setUpdatedAt] = useState<number | undefined>(undefined)
  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<PlayerHit[]>([])
  const [playerNote, setPlayerNote] = useState<string | null>(null)

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

  useEffect(() => {
    const text = query.trim()
    if (text.length < 2) {
      setHits([])
      setPlayerNote(null)
      return
    }
    let cancel = false
    setPlayerNote(copy.checking)
    const timer = setTimeout(() => {
      searchPlayers(text)
        .then((found) => {
          if (cancel) return
          setHits(found)
          setPlayerNote(found.length ? null : copy.noPlayers)
        })
        .catch(() => {
          if (cancel) return
          setHits([])
          setPlayerNote(copy.failed)
        })
    }, 280)
    return () => {
      cancel = true
      clearTimeout(timer)
    }
  }, [query])

  const pinnedIds = new Set(profile.watchedPlayers.map((player) => player.id))
  const freshHits = hits.filter((hit) => !pinnedIds.has(hit.id))
  const searching = query.trim().length >= 2

  function pin(hit: PlayerHit) {
    const abbr = teamAbbr(hit.teamName, teams)
    const card: PlayerCard = {
      id: hit.id,
      name: hit.name,
      teamAbbr: abbr,
      position: hit.position ?? '',
      active: true,
      stats: {},
      numbers: {},
      headshot: hit.headshot,
    }
    watchPlayer(card)
  }

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
      <TeamBrowser
        teams={teams}
        yourId={profile.primaryTeamId}
        placeholder={copy.searchLeague}
        onQueryChange={setQuery}
        onPress={(id) => router.push(`/team/${id}`)}
        belowSearch={
          profile.watchedPlayers.length || searching ? (
          <View style={{ gap: 8 }}>
            {profile.watchedPlayers.length ? (
              <View style={{ gap: 6 }}>
                <Text style={[label, { color: skin.accent }]}>{copy.pinnedPlayers}</Text>
                {profile.watchedPlayers.map((player) => (
                  <PlayerRow
                    key={player.id}
                    logo={player.teamAbbr}
                    title={player.name}
                    detail={[player.position, player.teamAbbr].filter(Boolean).join(' · ')}
                    action={copy.unpin}
                    onOpen={() => router.push(`/player/${player.id}` as Href)}
                    onAction={() => unwatchPlayer(player.id)}
                  />
                ))}
              </View>
            ) : null}
            {searching && (playerNote || freshHits.length) ? (
              <View style={{ gap: 6 }}>
                <Text style={[label, { color: skin.accent }]}>{copy.players}</Text>
                {playerNote ? <Muted>{playerNote}</Muted> : null}
                {freshHits.map((hit) => (
                  <PlayerRow
                    key={hit.id}
                    logo={teamAbbr(hit.teamName, teams)}
                    title={hit.name}
                    detail={[hit.position, hit.teamName].filter(Boolean).join(' · ')}
                    action={copy.pin}
                    onOpen={() => router.push(`/player/${hit.id}` as Href)}
                    onAction={() => pin(hit)}
                  />
                ))}
              </View>
            ) : null}
          </View>
          ) : null
        }
      />
    </Screen>
  )
}

function PlayerRow({
  logo,
  title,
  detail,
  action,
  onOpen,
  onAction,
}: {
  logo?: string
  title: string
  detail: string
  action: string
  onOpen: () => void
  onAction: () => void
}) {
  const skin = useTeamSkin()
  return (
    <View style={[row, { backgroundColor: skin.card, borderColor: skin.line }]}>
      <Pressable style={{ flex: 1 }} onPress={onOpen} accessibilityRole="button">
        <Text style={name}>{title}</Text>
        {logo || detail ? (
          <View style={detailRow}>
            {logo ? <Logo abbr={logo} size={28} /> : null}
            {detail ? <Text style={sub}>{detail}</Text> : null}
          </View>
        ) : null}
      </Pressable>
      <Pressable onPress={onAction} hitSlop={8} accessibilityRole="button">
        <Text style={[pinText, { color: skin.accent }]}>{action}</Text>
      </Pressable>
    </View>
  )
}

function teamAbbr(teamName: string, teams: CatalogTeam[]): string {
  const needle = teamName.toLowerCase()
  const found = teams.find((team) => {
    const name = team.name.toLowerCase()
    const city = team.city.toLowerCase()
    return needle === name || needle.includes(name) || needle.startsWith(city)
  })
  return found?.abbr ?? ''
}

const label = { fontFamily: font.display, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' as const }
const row = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  gap: 10,
  borderWidth: 1,
  borderRadius: 8,
  paddingHorizontal: 10,
  paddingVertical: 8,
}
const detailRow = { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8, marginTop: 2 }
const name = { color: theme.chalk, fontFamily: font.bodyMed, fontSize: 16 }
const sub = { color: theme.muted, fontFamily: font.body, fontSize: 13 }
const pinText = { fontFamily: font.display, fontSize: 13, letterSpacing: 0.6, textTransform: 'uppercase' as const }
