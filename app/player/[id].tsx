import { useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { Image, Text } from 'react-native'

import { ActionButton, Card, Muted, Screen, useTeamSkin } from '@/src/components/shell'
import { copy } from '@/src/config/copy'
import { playerLine, playerLineDefault, statLabels } from '@/src/config/statCatalog'
import { font, theme } from '@/src/config/theme'
import { loadPlayer } from '@/src/data/repository'
import type { PlayerCard } from '@/src/data/types'
import { useApp } from '@/src/state/AppState'

export default function PlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { profile, watchPlayer, unwatchPlayer, addPlayer } = useApp()
  const skin = useTeamSkin()
  const [player, setPlayer] = useState<PlayerCard | null>(null)
  const [failed, setFailed] = useState(false)
  const [note, setNote] = useState<string | null>(null)

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
  const onSheet = profile.roster.some((item) => item.id === id)

  return (
    <Screen back title={player?.name || copy.playerTitle} banner={failed ? copy.failed : null}>
      {!player && !failed ? <Muted>{copy.checking}</Muted> : null}
      {player ? (
        <Card>
          {player.headshot ? <Image source={{ uri: player.headshot }} style={{ width: 72, height: 72, borderRadius: 36 }} /> : null}
          <Text style={name}>
            {player.position} {player.teamAbbr}
          </Text>
          {player.active ? null : <Muted>{copy.inactiveNote}</Muted>}
          <StatBlock player={player} />
          {player.active ? (
            <ActionButton
              label={watching ? copy.watching : copy.watchPlayer}
              onPress={() => (watching ? unwatchPlayer(player.id) : watchPlayer(player))}
            />
          ) : null}
          {player.active && !onSheet ? (
            <ActionButton
              label={copy.addToSheet}
              onPress={() => setNote(addPlayer(player) ?? 'Added to the first open spot.')}
            />
          ) : null}
          {note ? <Text style={{ color: skin.accent, fontFamily: font.body }}>{note}</Text> : null}
        </Card>
      ) : null}
    </Screen>
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

const name = { color: theme.chalk, fontFamily: font.display, fontSize: 22 }
const stat = { color: theme.chalk, fontFamily: font.body, fontSize: 16 }
