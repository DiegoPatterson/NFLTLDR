import { useState } from 'react'
import { router } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { copy } from '@/src/config/copy'
import { glossary } from '@/src/config/statCatalog'
import { font, theme } from '@/src/config/theme'
import { describeGame } from '@/src/data/espn'
import type { CompareRow, GameDetail, Injury, SlateGame } from '@/src/data/types'
import { Card, Logo, Muted, useAccent, useTeamSkin } from '@/src/components/shell'
import { useLiveClock } from '@/src/components/useLiveClock'

export function LiveBoard({ detail }: { detail: GameDetail }) {
  const skin = useTeamSkin()
  const [open, setOpen] = useState(false)
  const { game } = detail
  const line = describeGame(detail)
  const clock = useLiveClock(game, detail.updatedAt)
  return (
    <Card>
      <View style={styles.meta}>
        <StatusPill state={game.state} />
        <Text style={styles.detail}>{[clock, game.broadcast].filter(Boolean).join('  ·  ')}</Text>
        {game.redZone ? <Text style={styles.red}>Red zone</Text> : null}
      </View>
      <View style={styles.scoreRow}>
        <TeamScore side={game.away} possession={game.possessionId} />
        <TeamScore side={game.home} possession={game.possessionId} align="right" />
      </View>
      {game.downLine ? <Text style={[styles.down, { color: skin.accent }]}>{game.downLine}</Text> : null}
      <Text style={styles.tldr}>{line}</Text>
      {detail.pace ? <Text style={[styles.pace, { color: skin.accent }]}>{copy.seasonPace}</Text> : null}
      <View style={{ gap: 8 }}>
        {detail.rows.map((row) => (
          <Compare key={row.label} row={row} />
        ))}
        {open
          ? detail.more.map((row) => <Compare key={row.label} row={row} />)
          : null}
      </View>
      {detail.more.length ? (
        <Pressable onPress={() => setOpen((value) => !value)} accessibilityRole="button">
          <Text style={[styles.more, { color: skin.accent }]}>{open ? copy.fewerNumbers : copy.moreNumbers}</Text>
        </Pressable>
      ) : null}
      {detail.leaders.length ? (
        <View style={{ gap: 4 }}>
          {detail.leaders.slice(0, 3).map((leader) => (
            <Text key={`${leader.category}-${leader.name}`} style={styles.leader}>
              <Text style={styles.leaderCat}>{leader.category}  </Text>
              {leader.name} · {leader.line}
            </Text>
          ))}
        </View>
      ) : null}
    </Card>
  )
}

function StatusPill({ state }: { state: SlateGame['state'] }) {
  const skin = useTeamSkin()
  const label = state === 'in' ? copy.live : state === 'post' ? copy.final : copy.upcoming
  const color = state === 'in' ? theme.live : state === 'post' ? theme.muted : skin.accent
  return <Text style={[styles.pill, { color, borderColor: color }]}>{label}</Text>
}

function TeamScore({
  side,
  possession,
  align = 'left',
}: {
  side: SlateGame['home']
  possession?: string
  align?: 'left' | 'right'
}) {
  const skin = useTeamSkin()
  const hasBall = possession && possession === side.id
  return (
    <View style={[styles.team, align === 'right' && styles.teamRight]}>
      <View style={[styles.nameRow, align === 'right' && styles.teamRight]}>
        <Logo abbr={side.abbr} size={36} />
        <Text style={styles.abbr}>{side.abbr}</Text>
        {hasBall ? <View style={[styles.ball, { backgroundColor: skin.accent }]} /> : null}
      </View>
      {side.score ? <Text style={styles.score}>{side.score}</Text> : null}
      {side.record ? <Text style={styles.record}>{side.record}</Text> : null}
    </View>
  )
}

function Compare({ row }: { row: CompareRow }) {
  const skin = useTeamSkin()
  const [open, setOpen] = useState(false)
  const note = row.glossary ? glossary[row.glossary] : undefined
  const away = Number(row.away)
  const home = Number(row.home)
  const numeric = Number.isFinite(away) && Number.isFinite(home) && away + home > 0
  return (
    <View>
      <View style={styles.compare}>
        <Text style={styles.compareValue}>{row.away}</Text>
        <Pressable onPress={() => note && setOpen((value) => !value)} accessibilityRole="button">
          <Text style={styles.compareLabel}>{row.label}</Text>
        </Pressable>
        <Text style={[styles.compareValue, styles.right]}>{row.home}</Text>
      </View>
      {numeric ? (
        <View style={styles.track}>
          <View style={[styles.fill, { flex: away, backgroundColor: skin.accent }]} />
          <View style={[styles.fill, { flex: home, backgroundColor: theme.chalk }]} />
        </View>
      ) : null}
      {open && note ? <Text style={styles.note}>{note}</Text> : null}
    </View>
  )
}

export function MatchupCard({ game, injuries }: { game: SlateGame; injuries?: Injury[] }) {
  const listed = (injuries ?? []).filter((person) => person.name).slice(0, 4)
  return (
    <Pressable onPress={() => router.push(`/game/${game.id}`)} accessibilityRole="button">
      <Card>
        <View style={styles.meta}>
          <StatusPill state={game.state} />
          <Text style={styles.detail}>{game.state === 'pre' ? copy.kickoff : game.detail}</Text>
        </View>
        <View style={styles.scoreRow}>
          <TeamScore side={game.away} possession={game.possessionId} />
          <TeamScore side={game.home} possession={game.possessionId} align="right" />
        </View>
        {game.state === 'pre' ? (
          <Text style={styles.kickoff}>{[game.detail, game.broadcast].filter(Boolean).join('  ·  ')}</Text>
        ) : null}
        {listed.map((person) => (
          <Text key={`${person.name}-${person.status}`} style={styles.note}>
            {person.teamAbbr ? `${person.teamAbbr} · ` : ''}
            {person.name}
            {person.position ? ` · ${person.position}` : ''} · {person.status}
          </Text>
        ))}
      </Card>
    </Pressable>
  )
}

export function GameStrip({
  title,
  hint,
  games,
  onPress,
  stamp,
}: {
  title: string
  hint?: string
  games: SlateGame[]
  onPress: (id: string) => void
  /** When the scoreboard last arrived. Live clocks snap to that check. */
  stamp?: number
}) {
  const { accent } = useAccent()
  const skin = useTeamSkin()
  if (!games.length) return null
  return (
    <View style={{ gap: 8 }}>
      <Text style={styles.stripTitle}>{title}</Text>
      {hint ? <Muted>{hint}</Muted> : null}
      {games.map((game) => (
        <Pressable
          key={game.id}
          onPress={() => onPress(game.id)}
          accessibilityRole="button"
          style={[styles.stripRow, { backgroundColor: skin.card, borderColor: skin.line }]}>
          <View style={styles.stripLine}>
            <Logo abbr={game.away.abbr} size={22} />
            <Text style={styles.stripAbbr}>{game.away.abbr}</Text>
            <Text style={[styles.stripScore, { color: accent }]}>
              {game.state === 'pre' ? game.detail : `${game.away.score}–${game.home.score}`}
            </Text>
            <Text style={styles.stripAbbr}>{game.home.abbr}</Text>
            <Logo abbr={game.home.abbr} size={22} />
          </View>
          {game.state !== 'pre' ? <StripClock game={game} stamp={stamp} /> : null}
        </Pressable>
      ))}
    </View>
  )
}

function StripClock({ game, stamp }: { game: SlateGame; stamp?: number }) {
  const clock = useLiveClock(game, stamp)
  return <Text style={styles.stripName}>{clock}</Text>
}

const styles = StyleSheet.create({
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pill: {
    fontFamily: font.display,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    borderWidth: 1,
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  detail: { color: theme.chalk, fontFamily: font.bodyMed, fontSize: 14, flex: 1 },
  red: { color: theme.live, fontFamily: font.bodySemi, fontSize: 12, textTransform: 'uppercase' },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  team: { flex: 1, gap: 2 },
  teamRight: { alignItems: 'flex-end' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logo: { width: 28, height: 28 },
  swatch: { width: 10, height: 22, borderRadius: 2 },
  abbr: { color: theme.chalk, fontFamily: font.display, fontSize: 22, letterSpacing: 1 },
  ball: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.gold },
  score: { color: theme.chalk, fontFamily: font.display, fontSize: 52, lineHeight: 56 },
  kickoff: { color: theme.chalk, fontFamily: font.display, fontSize: 28, letterSpacing: 0.4 },
  record: { color: theme.faint, fontFamily: font.body, fontSize: 12 },
  down: { color: theme.gold, fontFamily: font.bodyMed, fontSize: 14 },
  tldr: { color: theme.chalk, fontFamily: font.body, fontSize: 15, lineHeight: 21 },
  pace: { color: theme.gold, fontFamily: font.body, fontSize: 12 },
  more: { color: theme.gold, fontFamily: font.display, letterSpacing: 0.8, fontSize: 14, textTransform: 'uppercase' },
  leader: { color: theme.muted, fontFamily: font.body, fontSize: 13 },
  leaderCat: { color: theme.faint, fontFamily: font.bodySemi },
  compare: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  compareValue: { color: theme.chalk, fontFamily: font.display, fontSize: 18, width: 72 },
  right: { textAlign: 'right' },
  compareLabel: { color: theme.faint, fontFamily: font.bodyMed, fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase' },
  track: { flexDirection: 'row', height: 3, borderRadius: 2, overflow: 'hidden', backgroundColor: theme.lineSoft, marginTop: 4 },
  fill: { height: 3 },
  note: { color: theme.muted, fontFamily: font.body, fontSize: 12, lineHeight: 16, marginTop: 4 },
  stripTitle: { color: theme.chalk, fontFamily: font.display, fontSize: 16, letterSpacing: 1, textTransform: 'uppercase' },
  stripRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: theme.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.lineSoft,
    gap: 2,
  },
  stripLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stripAbbr: { color: theme.chalk, fontFamily: font.display, fontSize: 16, letterSpacing: 0.6 },
  stripScore: { flex: 1, textAlign: 'center', fontFamily: font.display, fontSize: 18, letterSpacing: 0.4 },
  stripName: { color: theme.muted, fontFamily: font.body, fontSize: 13 },
})
