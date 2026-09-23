import { useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { Image, Text, View } from 'react-native'

import { ActionButton, Card, Logo, Muted, Screen, TeamSkinOverride, useTeamSkin } from '@/src/components/shell'
import { copy } from '@/src/config/copy'
import { nflTeams } from '@/src/config/nflTeams'
import { playerLine, playerLineDefault, statLabels } from '@/src/config/statCatalog'
import { font, theme } from '@/src/config/theme'
import { loadPlayer } from '@/src/data/repository'
import type { PlayerCard, PlayerClub, PlayerNote } from '@/src/data/types'
import { yearSpan } from '@/src/logic/playerFacts'
import { useApp } from '@/src/state/AppState'

export default function PlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { profile, watchPlayer, unwatchPlayer } = useApp()
  const [player, setPlayer] = useState<PlayerCard | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancel = false
    loadPlayer({ id, name: '', teamName: '' })
      .then((card) => {
        if (!cancel) setPlayer(card)
      })
      .catch(() => {
        if (!cancel) setFailed(true)
      })
    return () => {
      cancel = true
    }
  }, [id])

  const watching = profile.watchedPlayers.some((item) => item.id === id)
  const clubs = player?.clubs ?? []
  const listed = nflTeams.find((team) => team.abbr === player?.teamAbbr)
  const teamName = player?.teamName || listed?.name || ''

  return (
    <TeamSkinOverride abbr={player?.teamAbbr}>
      <Screen back title={player?.name || copy.playerTitle} banner={failed ? copy.failed : null}>
        {!player && !failed ? <Muted>{copy.checking}</Muted> : null}
        {player ? (
          <Card>
          <View style={identity}>
            {player.headshot ? <Image source={{ uri: player.headshot }} style={head} /> : null}
            <View style={who}>
              <Text style={playerName}>{player.name}</Text>
              <View style={teamLine}>
                {player.teamAbbr ? <Logo abbr={player.teamAbbr} size={36} /> : null}
                {teamName ? <Text style={teamLabel}>{teamName}</Text> : null}
              </View>
              {player.position ? <Text style={pos}>{player.position}</Text> : null}
            </View>
          </View>
          {clubs.length === 1 ? <Muted>{yearSpan(clubs[0].from, clubs[0].to)}</Muted> : null}
          {player.active ? null : (
            <Muted>{player.status && !/^inactive$/i.test(player.status) ? player.status : copy.inactiveNote}</Muted>
          )}
          <Fact label={copy.playerJersey} value={player.jersey} />
          <Fact label={copy.playerExperience} value={player.experience} />
          <Fact label={copy.playerCollege} value={player.college} />
          <Fact label={copy.playerDraft} value={player.draft} />
          {clubs.length > 1 ? <Clubs clubs={clubs} /> : null}
          {player.injury ? (
            <View style={block}>
              <Kicker>{copy.playerInjury}</Kicker>
              <Text style={line}>{player.injury}</Text>
              {player.injuryNote ? <Muted>{player.injuryNote}</Muted> : null}
            </View>
          ) : null}
          {player.latest ? <NoteBlock label={copy.playerLatest} note={player.latest} /> : null}
          {player.news?.length ? (
            <View style={block}>
              <Kicker>{copy.playerNews}</Kicker>
              {player.news.map((note) => (
                <View key={note.headline} style={block}>
                  <Text style={line}>{note.headline}</Text>
                  {note.detail ? <Muted>{note.detail}</Muted> : null}
                </View>
              ))}
            </View>
          ) : null}
          <StatBlock player={player} />
          <ActionButton
            label={watching ? copy.unpin : copy.pin}
            onPress={() => (watching ? unwatchPlayer(player.id) : watchPlayer(player))}
          />
          </Card>
        ) : null}
      </Screen>
    </TeamSkinOverride>
  )
}

function Kicker({ children }: { children: string }) {
  const skin = useTeamSkin()
  return <Text style={[kicker, { color: skin.accent }]}>{children}</Text>
}

function Fact({ label, value }: { label: string; value?: string }) {
  const skin = useTeamSkin()
  if (!value) return null
  return (
    <Text style={line}>
      <Text style={[factLabel, { color: skin.faint }]}>{label}  </Text>
      {value}
    </Text>
  )
}

function Clubs({ clubs }: { clubs: PlayerClub[] }) {
  const skin = useTeamSkin()
  return (
    <View style={block}>
      <Kicker>{copy.playerClubs}</Kicker>
      {clubs.map((club) => (
        <View key={`${club.teamId}-${club.from}`} style={clubRow}>
          {club.abbr ? <Logo abbr={club.abbr} size={28} /> : null}
          <Text style={clubName}>{club.name || club.abbr}</Text>
          <Text style={[clubYears, { color: skin.muted }]}>{yearSpan(club.from, club.to)}</Text>
        </View>
      ))}
    </View>
  )
}

function NoteBlock({ label, note }: { label: string; note: PlayerNote }) {
  const title = note.when ? `${label} · ${note.when}` : label
  return (
    <View style={block}>
      <Kicker>{title}</Kicker>
      {note.headline ? <Text style={line}>{note.headline}</Text> : null}
      {note.detail ? <Muted>{note.detail}</Muted> : null}
    </View>
  )
}

function StatBlock({ player }: { player: PlayerCard }) {
  const spec = playerLine[player.position] ?? playerLineDefault
  const rows = [...spec.main, ...spec.more].flatMap((key) => {
    const value = player.stats[key]
    if (!value) return []
    return [`${statLabels[key] ?? key}  ${value}`]
  })
  if (!rows.length) return <Muted>{copy.statMiss}</Muted>
  return (
    <>
      {rows.map((row) => (
        <Text key={row} style={stat}>
          {row}
        </Text>
      ))}
    </>
  )
}

const identity = { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 14 }
const who = { flex: 1, gap: 6 }
const teamLine = { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8 }
const head = { width: 84, height: 84, borderRadius: 42 }
const playerName = { color: theme.chalk, fontFamily: font.display, fontSize: 26, lineHeight: 30 }
const teamLabel = { flex: 1, color: theme.chalk, fontFamily: font.bodyMed, fontSize: 18, lineHeight: 22 }
const pos = { color: theme.chalk, fontFamily: font.display, fontSize: 16, letterSpacing: 0.8 }
const line = { color: theme.chalk, fontFamily: font.body, fontSize: 16, lineHeight: 22 }
const factLabel = { fontFamily: font.bodyMed }
const stat = { color: theme.chalk, fontFamily: font.body, fontSize: 16 }
const block = { gap: 4 }
const kicker = { fontFamily: font.display, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' as const }
const clubRow = { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8 }
const clubName = { flex: 1, color: theme.chalk, fontFamily: font.bodyMed, fontSize: 16 }
const clubYears = { fontFamily: font.body, fontSize: 14 }
