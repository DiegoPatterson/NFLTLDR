import { router, useLocalSearchParams, type Href } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { Pressable, Text, View } from 'react-native'

import { TeamDigest } from '@/src/components/digest'
import { ActionButton, Card, Muted, Screen, TeamSkinOverride, updatedLabel, useTeamSkin } from '@/src/components/shell'
import { NewsTicker } from '@/src/components/ticker'
import { copy } from '@/src/config/copy'
import { nflTeams } from '@/src/config/nflTeams'
import { font, theme } from '@/src/config/theme'
import { getDigest, getNews, loadRoster } from '@/src/data/repository'
import type { Digest, PlayerCard } from '@/src/data/types'
import type { RosterIndexPlayer } from '@/src/data/espn'
import { useApp } from '@/src/state/AppState'

const positionOrder = [
  'QB',
  'RB',
  'FB',
  'WR',
  'TE',
  'OT',
  'OG',
  'G',
  'C',
  'OL',
  'T',
  'DE',
  'DT',
  'NT',
  'DL',
  'LB',
  'ILB',
  'OLB',
  'MLB',
  'CB',
  'S',
  'FS',
  'SS',
  'DB',
  'K',
  'P',
  'LS',
  'PK',
]

const positionName: Record<string, string> = {
  QB: 'Quarterback',
  RB: 'Running back',
  FB: 'Fullback',
  WR: 'Wide receiver',
  TE: 'Tight end',
  OT: 'Offensive tackle',
  OG: 'Offensive guard',
  G: 'Guard',
  C: 'Center',
  OL: 'Offensive line',
  T: 'Tackle',
  DE: 'Defensive end',
  DT: 'Defensive tackle',
  NT: 'Nose tackle',
  DL: 'Defensive line',
  LB: 'Linebacker',
  ILB: 'Inside linebacker',
  OLB: 'Outside linebacker',
  MLB: 'Middle linebacker',
  CB: 'Cornerback',
  S: 'Safety',
  FS: 'Free safety',
  SS: 'Strong safety',
  DB: 'Defensive back',
  K: 'Kicker',
  P: 'Punter',
  LS: 'Long snapper',
  PK: 'Kicker',
}

export default function TeamScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { profile, setPrimaryTeam } = useApp()
  const [digest, setDigest] = useState<Digest | null>(null)
  const [ticker, setTicker] = useState<string[]>([])
  const [failed, setFailed] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [rosterReload, setRosterReload] = useState(0)

  const load = useCallback(
    async (force = false) => {
      if (!id) return
      try {
        setDigest(await getDigest(id, force))
        setFailed(false)
      } catch {
        setFailed(true)
      }
    },
    [id],
  )

  useEffect(() => {
    load(false).catch(() => undefined)
    getNews()
      .then((result) => setTicker(result.data.filter((item) => item.big).map((item) => item.headline)))
      .catch(() => undefined)
  }, [load])

  const yours = id === profile.primaryTeamId
  const listed = nflTeams.find((team) => team.id === id)
  const abbr = digest?.abbr || listed?.abbr || null

  return (
    <TeamSkinOverride abbr={abbr}>
      <Screen
        back
        safeBottom
        title={abbr || 'Team'}
        banner={failed && !digest ? copy.failed : digest?.stale ? copy.stale : null}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true)
          setRosterReload((value) => value + 1)
          load(true)
            .catch(() => undefined)
            .finally(() => setRefreshing(false))
        }}
        footer={digest ? <Muted>{updatedLabel(digest.updatedAt)}</Muted> : null}>
        <NewsTicker items={ticker} />
        {!digest && !failed ? <Muted>{copy.checking}</Muted> : null}
        {digest ? <TeamDigest digest={digest} /> : null}
        {id && abbr ? (
          <Roster
            teamId={id}
            teamAbbr={abbr}
            teamName={digest?.name || listed?.name || abbr}
            reloadKey={rosterReload}
          />
        ) : null}
        {id ? (
          <ActionButton
            label={yours ? copy.alreadyYours : copy.setAsTeam}
            onPress={() => {
              if (yours) return
              setPrimaryTeam(id)
              router.replace('/(tabs)/home')
            }}
          />
        ) : null}
      </Screen>
    </TeamSkinOverride>
  )
}

function Roster({
  teamId,
  teamAbbr,
  teamName,
  reloadKey,
}: {
  teamId: string
  teamAbbr: string
  teamName: string
  reloadKey: number
}) {
  const skin = useTeamSkin()
  const { profile, watchPlayer, unwatchPlayer } = useApp()
  const [open, setOpen] = useState(false)
  const [people, setPeople] = useState<RosterIndexPlayer[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    let cancel = false
    setLoading(true)
    loadRoster(teamId, reloadKey > 0)
      .then((result) => {
        if (cancel) return
        setPeople(result.data)
        setFailed(false)
      })
      .catch(() => {
        if (!cancel) setFailed(true)
      })
      .finally(() => {
        if (!cancel) setLoading(false)
      })
    return () => {
      cancel = true
    }
  }, [open, teamId, reloadKey])

  const groups = people ? groupRoster(people) : []

  function pin(player: RosterIndexPlayer) {
    const card: PlayerCard = {
      id: player.id,
      name: player.name,
      teamAbbr,
      teamName,
      position: player.position,
      active: player.active,
      stats: {},
      numbers: {},
    }
    watchPlayer(card)
  }

  return (
    <Card>
      <Pressable onPress={() => setOpen((value) => !value)} accessibilityRole="button">
        <Text style={[section, { color: skin.accent }]}>
          {copy.players}  {open ? '–' : '+'}
        </Text>
      </Pressable>
      {open && loading && !people ? <Muted>{copy.checking}</Muted> : null}
      {open && failed && !people ? <Muted>{copy.failed}</Muted> : null}
      {open && people && !people.length ? <Muted>{copy.noRoster}</Muted> : null}
      {open
        ? groups.map((group) => (
            <View key={group.key} style={{ gap: 6 }}>
              <Text style={[groupLabel, { color: skin.accent }]}>{group.label}</Text>
              {group.people.map((player) => {
                const pinned = profile.watchedPlayers.some((item) => item.id === player.id)
                return (
                  <View key={player.id} style={[row, { backgroundColor: skin.card2, borderColor: skin.line }]}>
                    <Pressable
                      style={{ flex: 1 }}
                      onPress={() => router.push(`/player/${player.id}` as Href)}
                      accessibilityRole="button">
                      <Text style={playerName}>{player.name}</Text>
                      {player.position ? <Text style={[pos, { color: skin.muted }]}>{player.position}</Text> : null}
                    </Pressable>
                    <Pressable
                      onPress={() => (pinned ? unwatchPlayer(player.id) : pin(player))}
                      hitSlop={8}
                      accessibilityRole="button">
                      <Text style={[pinText, { color: skin.accent }]}>{pinned ? copy.unpin : copy.pin}</Text>
                    </Pressable>
                  </View>
                )
              })}
            </View>
          ))
        : null}
    </Card>
  )
}

function groupRoster(people: RosterIndexPlayer[]) {
  const buckets = new Map<string, RosterIndexPlayer[]>()
  for (const player of people) {
    const key = player.position.toUpperCase() || 'Roster'
    const list = buckets.get(key) ?? []
    list.push(player)
    buckets.set(key, list)
  }
  for (const list of buckets.values()) {
    list.sort((a, b) => (a.usage ?? 99999) - (b.usage ?? 99999))
  }
  const rest = [...buckets.keys()].filter((key) => !positionOrder.includes(key)).sort()
  return [...positionOrder.filter((key) => buckets.has(key)), ...rest].map((key) => ({
    key,
    label: positionName[key] || key,
    people: buckets.get(key) ?? [],
  }))
}

const section = { fontFamily: font.display, fontSize: 18, letterSpacing: 0.8, textTransform: 'uppercase' as const }
const groupLabel = {
  fontFamily: font.display,
  fontSize: 13,
  letterSpacing: 1,
  textTransform: 'uppercase' as const,
  marginTop: 6,
}
const row = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  gap: 10,
  borderWidth: 1,
  borderRadius: 8,
  paddingHorizontal: 10,
  paddingVertical: 8,
}
const playerName = { color: theme.chalk, fontFamily: font.bodyMed, fontSize: 16 }
const pos = { fontFamily: font.body, fontSize: 13 }
const pinText = { fontFamily: font.display, fontSize: 13, letterSpacing: 0.6, textTransform: 'uppercase' as const }
