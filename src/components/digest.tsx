import { router } from 'expo-router'
import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { copy } from '@/src/config/copy'
import { features } from '@/src/config/features'
import { glossary } from '@/src/config/statCatalog'
import { font, theme } from '@/src/config/theme'
import type { Digest, Injury, StatChip } from '@/src/data/types'
import { Card, Logo, Muted, useTeamSkin } from '@/src/components/shell'

export function TeamDigest({
  digest,
  showDivision = true,
  skipGameId,
}: {
  digest: Digest
  showDivision?: boolean
  skipGameId?: string
}) {
  const skin = useTeamSkin()
  return (
    <View style={{ gap: 12 }}>
      <Card style={styles.flush}>
        <ClubStripe field={digest.color} accent={digest.alt} />
        <View style={styles.pad}>
          <View style={styles.identity}>
            <Logo abbr={digest.abbr} size={52} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{digest.name}</Text>
              <Text style={[styles.record, { color: skin.accent }]}>
                {digest.record || '—'}
                {digest.standing ? `  ·  ${digest.standing}` : ''}
              </Text>
            </View>
          </View>
          <Text style={styles.tldr}>{digest.tldr}</Text>
          <View style={styles.facts}>
            <Fact label={digest.pointsForLabel} value={digest.pointsFor} />
            <Fact label={digest.pointsAgainstLabel} value={digest.pointsAgainst} />
            <Fact label="Streak" value={digest.streak || '—'} />
          </View>
        </View>
      </Card>

      {digest.next && digest.next.id !== skipGameId ? (
        <GameLink label="Next" game={digest.next} />
      ) : digest.next ? null : (
        <Muted>{copy.noneScheduled}</Muted>
      )}
      {digest.last && digest.last.id !== skipGameId ? <GameLink label="Last" game={digest.last} /> : null}
      <ScheduleList games={digest.upcoming} byeWeek={digest.byeWeek} abbr={digest.abbr} />
      <ScoreList games={digest.results} />
      <Sideline notes={digest.notes} />

      {digest.sections.map((section) => (
        <StatSection key={section.id} title={section.title} blurb={section.blurb} main={section.main} more={section.more} />
      ))}

      {digest.leaders.length ? (
        <Card>
          <Text style={[styles.section, { color: skin.accent }]}>{copy.lastGameLeaders}</Text>
          <Muted>{copy.leadersHint}</Muted>
          {digest.leaders.map((leader) => (
            <Text key={`${leader.category}-${leader.name}`} style={[styles.leader, { color: skin.muted }]}>
              {leader.category} · {leader.name} · {leader.line}
            </Text>
          ))}
        </Card>
      ) : null}

      <InjuryBlock people={digest.injuries} />

      {showDivision && features.showDivisionSnapshot && digest.division.length ? (
        <Card>
          <Text style={[styles.section, { color: skin.accent }]}>{copy.division}</Text>
          <Muted>{copy.divisionHint}</Muted>
          {digest.division.map((row) => (
            <Pressable
              key={row.id}
              onPress={() => router.push(`/team/${row.id}`)}
              style={[styles.divRow, row.yours && { backgroundColor: skin.headerBg, borderRadius: 6, paddingHorizontal: 6 }]}>
              <Text style={[styles.divAbbr, { color: row.yours ? skin.accent : theme.chalk }]}>{row.abbr}</Text>
              <Text style={styles.divName}>{row.name}</Text>
              <Text style={styles.divRec}>{row.record}</Text>
            </Pressable>
          ))}
        </Card>
      ) : null}
    </View>
  )
}

function ClubStripe({ field, accent }: { field: string; accent: string }) {
  return (
    <View style={styles.stripe}>
      <View style={{ flex: 1, backgroundColor: field }} />
      <View style={{ flex: 1, backgroundColor: accent }} />
    </View>
  )
}

function Sideline({ notes }: { notes: Digest['notes'] }) {
  const skin = useTeamSkin()
  const [open, setOpen] = useState<string | null>(null)
  if (!notes?.length) return null
  return (
    <Card>
      <Text style={[styles.section, { color: skin.accent }]}>{copy.fromBuilding}</Text>
      <Muted>{copy.fromBuildingHint}</Muted>
      {notes.map((note, index) => {
        const shown = open === note.headline
        return (
          <Pressable
            key={`${note.headline}-${index}`}
            onPress={() => setOpen(shown ? null : note.headline)}
            accessibilityRole="button">
            <Text style={[styles.leader, { color: skin.muted }]}>{note.headline}</Text>
            {shown && note.detail ? <Muted>{note.detail}</Muted> : null}
          </Pressable>
        )
      })}
    </Card>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  const skin = useTeamSkin()
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.factValue}>{value}</Text>
      <Text style={[styles.factLabel, { color: skin.faint }]}>{label}</Text>
    </View>
  )
}

function ScheduleList({ games, byeWeek, abbr }: { games: Digest['upcoming']; byeWeek?: number; abbr: string }) {
  const skin = useTeamSkin()
  const [open, setOpen] = useState(false)
  const rows = scheduleRows(games, byeWeek, abbr)
  if (!rows.length) return null
  return (
    <Card>
      <Pressable onPress={() => setOpen((value) => !value)} accessibilityRole="button">
        <Text style={[styles.section, { color: skin.accent }]}>
          {copy.schedule}  {open ? '–' : '+'}
        </Text>
      </Pressable>
      {open
        ? rows.map((row) =>
            row.gameId ? (
              <Pressable key={row.key} onPress={() => router.push(`/game/${row.gameId}`)} accessibilityRole="button">
                <Text style={styles.leader}>{row.text}</Text>
              </Pressable>
            ) : (
              <Text key={row.key} style={styles.leader}>
                {row.text}
              </Text>
            ),
          )
        : null}
    </Card>
  )
}

function scheduleRows(games: Digest['upcoming'], byeWeek: number | undefined, abbr: string) {
  const rows = games.map((game) => ({
    sort: weekNumber(game.week),
    key: game.id,
    gameId: game.id,
    text: [game.week, where(game, abbr), game.state === 'post' ? '' : game.detail, game.broadcast]
      .filter(Boolean)
      .join('  ·  '),
  }))
  if (byeWeek) {
    rows.push({ sort: byeWeek, key: `bye-${byeWeek}`, gameId: '', text: `Week ${byeWeek}  ·  ${copy.bye}` })
  }
  return rows.sort((a, b) => a.sort - b.sort || a.text.localeCompare(b.text))
}

function where(game: NonNullable<Digest['next']>, abbr: string): string {
  const home = game.home.abbr === abbr
  const opponent = home ? game.away.abbr : game.home.abbr
  return home ? `vs ${opponent}` : `at ${opponent}`
}

function weekNumber(week?: string): number {
  const match = (week || '').match(/(\d+)/)
  return match ? Number(match[1]) : 99
}

function ScoreList({ games }: { games: Digest['results'] }) {
  const skin = useTeamSkin()
  const [open, setOpen] = useState(true)
  if (!games.length) return null
  return (
    <Card>
      <Pressable onPress={() => setOpen((value) => !value)} accessibilityRole="button">
        <Text style={[styles.section, { color: skin.accent }]}>
          {copy.scores}  {open ? '–' : '+'}
        </Text>
      </Pressable>
      {open
        ? games.map((game) => (
            <Pressable key={game.id} onPress={() => router.push(`/game/${game.id}`)} accessibilityRole="button">
              <Text style={styles.leader}>
                {game.week ? `${game.week}  ·  ` : ''}
                {game.away.abbr} {game.away.score || '0'} at {game.home.abbr} {game.home.score || '0'}
              </Text>
            </Pressable>
          ))
        : null}
    </Card>
  )
}

function GameLink({ label, game }: { label: string; game: Digest['next'] }) {
  const skin = useTeamSkin()
  if (!game) return null
  const score =
    game.state === 'pre'
      ? [game.detail, game.broadcast].filter(Boolean).join('  ·  ')
      : `${game.away.abbr} ${game.away.score || '0'} · ${game.home.abbr} ${game.home.score || '0'}`
  return (
    <Pressable onPress={() => router.push(`/game/${game.id}`)} style={[styles.linkCard, { backgroundColor: skin.card, borderColor: skin.line }]}>
      <Text style={[styles.linkLabel, { color: skin.accent }]}>{label}</Text>
      <Text style={styles.linkMain}>{game.shortName}</Text>
      <Text style={[styles.linkSub, { color: skin.muted }]}>{score}</Text>
    </Pressable>
  )
}

function StatSection({
  title,
  blurb,
  main,
  more,
}: {
  title: string
  blurb: string
  main: StatChip[]
  more: StatChip[]
}) {
  const skin = useTeamSkin()
  const [open, setOpen] = useState(false)
  return (
    <Card>
      <Pressable onPress={() => setOpen((value) => !value)} accessibilityRole="button">
        <Text style={[styles.section, { color: skin.accent }]}>
          {title}  {open ? '–' : '+'}
        </Text>
      </Pressable>
      <View style={styles.grid}>
        {main.map((chip) => (
          <Chip key={chip.label} chip={chip} />
        ))}
      </View>
      {open ? (
        <View style={{ gap: 8 }}>
          <Muted>{blurb}</Muted>
          {more.map((chip) => (
            <Chip key={chip.label} chip={chip} wide />
          ))}
        </View>
      ) : null}
    </Card>
  )
}

function Chip({ chip, wide }: { chip: StatChip; wide?: boolean }) {
  const skin = useTeamSkin()
  const [open, setOpen] = useState(false)
  const note = chip.glossary ? glossary[chip.glossary] : undefined
  return (
    <Pressable onPress={() => note && setOpen((value) => !value)} style={wide ? styles.wideChip : styles.chip}>
      <Text style={styles.factValue}>{chip.value}</Text>
      <Text style={[styles.factLabel, { color: skin.faint }]}>{chip.label}</Text>
      {open && note ? <Text style={styles.note}>{note}</Text> : null}
    </Pressable>
  )
}

function InjuryBlock({ people }: { people: Injury[] }) {
  const skin = useTeamSkin()
  const [open, setOpen] = useState(false)
  const counts = countStatuses(people)
  const summary = counts.length ? counts.map((item) => `${item.count} ${item.status.toLowerCase()}`).join(' · ') : copy.noInjuries
  const shown = open ? people : people.slice(0, 4)
  return (
    <Card>
      <Pressable onPress={() => setOpen((value) => !value)} accessibilityRole="button">
        <Text style={[styles.section, { color: skin.accent }]}>
          {copy.injuries}  {people.length ? (open ? '–' : '+') : ''}
        </Text>
      </Pressable>
      <Muted>{summary}</Muted>
      {open ? <Muted>{copy.injuriesHint}</Muted> : null}
      {shown.map((person) => (
        <View key={`${person.name}-${person.status}`} style={styles.injRow}>
          <Text style={[styles.injStatus, { color: skin.accent }]}>{person.status}</Text>
          <Text style={styles.injName}>
            {person.name}
            {person.position ? ` · ${person.position}` : ''}
            {person.teamAbbr ? ` · ${person.teamAbbr}` : ''}
          </Text>
        </View>
      ))}
      {!open && people.length > shown.length ? (
        <Text style={[styles.more, { color: skin.accent }]} onPress={() => setOpen(true)}>
          {people.length - shown.length} {copy.moreInjuries}
        </Text>
      ) : null}
    </Card>
  )
}

function countStatuses(people: Injury[]): { status: string; count: number }[] {
  const map = new Map<string, number>()
  for (const person of people) map.set(person.status, (map.get(person.status) ?? 0) + 1)
  return [...map.entries()].map(([status, count]) => ({ status, count }))
}

export function YourClubCard({ digest }: { digest: Digest }) {
  const skin = useTeamSkin()
  return (
    <Pressable
      onPress={() => router.push(`/team/${digest.teamId}`)}
      style={[styles.linkCard, styles.flush, { backgroundColor: skin.card, borderColor: skin.line }]}>
      <ClubStripe field={digest.color} accent={digest.alt} />
      <View style={styles.pad}>
        <Text style={[styles.linkLabel, { color: skin.accent }]}>{copy.yourClub}</Text>
        <Text style={styles.linkMain}>
          {digest.abbr} {digest.record}
        </Text>
        <Text style={[styles.linkSub, { color: skin.muted }]}>{digest.standing || copy.openTeam}</Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  flush: { padding: 0, overflow: 'hidden' },
  pad: { padding: 14, gap: 8 },
  stripe: { flexDirection: 'row', height: 8 },
  identity: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  logo: { width: 52, height: 52 },
  swatch: { width: 14, height: 48, borderRadius: 3 },
  name: { color: theme.chalk, fontFamily: font.display, fontSize: 26, letterSpacing: 0.4 },
  record: { color: theme.gold, fontFamily: font.bodyMed, fontSize: 14 },
  tldr: { color: theme.chalk, fontFamily: font.body, fontSize: 15, lineHeight: 21 },
  facts: { flexDirection: 'row', gap: 8 },
  factValue: { color: theme.chalk, fontFamily: font.display, fontSize: 22 },
  factLabel: { color: theme.faint, fontFamily: font.bodyMed, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' },
  section: { color: theme.chalk, fontFamily: font.display, fontSize: 18, letterSpacing: 0.8, textTransform: 'uppercase' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { width: '47%', gap: 2 },
  wideChip: { gap: 2 },
  note: { color: theme.muted, fontFamily: font.body, fontSize: 12, lineHeight: 16 },
  leader: { color: theme.muted, fontFamily: font.body, fontSize: 14 },
  linkCard: {
    backgroundColor: theme.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.lineSoft,
    padding: 14,
    gap: 2,
  },
  linkLabel: { color: theme.faint, fontFamily: font.display, letterSpacing: 1, fontSize: 12, textTransform: 'uppercase' },
  linkMain: { color: theme.chalk, fontFamily: font.display, fontSize: 20 },
  linkSub: { color: theme.muted, fontFamily: font.body, fontSize: 14 },
  injRow: { flexDirection: 'row', gap: 8, alignItems: 'baseline' },
  injStatus: { color: theme.gold, fontFamily: font.bodySemi, fontSize: 12, width: 92 },
  injName: { color: theme.chalk, fontFamily: font.body, fontSize: 14, flex: 1 },
  more: { color: theme.gold, fontFamily: font.bodyMed, fontSize: 13 },
  divRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  divAbbr: { color: theme.chalk, fontFamily: font.display, width: 42, fontSize: 16 },
  yours: { color: theme.gold },
  divName: { color: theme.muted, fontFamily: font.body, flex: 1, fontSize: 14 },
  divRec: { color: theme.chalk, fontFamily: font.display, fontSize: 16 },
})
