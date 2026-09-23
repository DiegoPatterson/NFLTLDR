import { useMemo, useState, type ReactNode } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'

import { copy } from '@/src/config/copy'
import { conferenceOrder } from '@/src/config/nflTeams'
import { fuzzyCutoff, fuzzyScore } from '@/src/logic/fuzzy'
import { font, theme } from '@/src/config/theme'
import type { CatalogTeam } from '@/src/data/types'
import { Logo, useAccent, useTeamSkin } from '@/src/components/shell'
import { mix } from '@/src/logic/color'

export function TeamBrowser({
  teams,
  selectedId,
  yourId,
  onPress,
  onQueryChange,
  belowSearch,
  placeholder,
}: {
  teams: CatalogTeam[]
  selectedId?: string | null
  yourId?: string | null
  onPress: (id: string) => void
  onQueryChange?: (query: string) => void
  belowSearch?: ReactNode
  placeholder?: string
}) {
  const [query, setQuery] = useState('')
  const { accent, accentInk } = useAccent()
  const skin = useTeamSkin()
  const needle = query.trim()
  const filtered = useMemo(() => {
    if (!needle) return teams
    return teams.filter((team) => {
      const nick = team.name.split(' ').slice(-1)[0] ?? ''
      const score = Math.max(
        fuzzyScore(needle, team.name),
        fuzzyScore(needle, team.city),
        fuzzyScore(needle, team.abbr),
        fuzzyScore(needle, nick),
      )
      return score >= fuzzyCutoff
    })
  }, [needle, teams])
  const groups = conferenceOrder.flatMap((conference) => {
    const divisions = [...new Set(filtered.filter((team) => team.conference === conference).map((team) => team.division))]
    return divisions.map((division) => ({
      key: division,
      teams: filtered.filter((team) => team.division === division),
    }))
  })

  return (
    <View style={{ gap: 14 }}>
      <TextInput
        value={query}
        onChangeText={(value) => {
          setQuery(value)
          onQueryChange?.(value)
        }}
        placeholder={placeholder ?? copy.searchTeams}
        placeholderTextColor={theme.faint}
        style={[styles.input, { backgroundColor: skin.card, borderColor: skin.line }]}
        autoCorrect={false}
        autoCapitalize="none"
      />
      {belowSearch}
      {groups.map((group) =>
        group.teams.length ? (
          <View key={group.key} style={{ gap: 6 }}>
            <Text style={[styles.division, { color: skin.accent }]}>{group.key}</Text>
            {group.teams.map((team) => {
              const selected = team.id === selectedId
              const yours = team.id === yourId
              return (
                <Pressable
                  key={team.id}
                  onPress={() => onPress(team.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={({ pressed }) => [
                    styles.row,
                    { backgroundColor: skin.card, borderColor: skin.line },
                    pressed && { opacity: 0.7 },
                    selected && {
                      borderColor: accent,
                      borderWidth: 2,
                      backgroundColor: mix(skin.card, accent, 0.28),
                    },
                  ]}>
                  {selected ? <View style={[styles.pickedBar, { backgroundColor: accent }]} /> : null}
                  <Logo abbr={team.abbr} size={36} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{team.name}</Text>
                    <Text style={styles.sub}>{team.abbr}</Text>
                  </View>
                  {team.record ? <Text style={styles.record}>{team.record}</Text> : null}
                  {selected ? (
                    <View style={[styles.tag, { backgroundColor: accent }]}>
                      <Text style={[styles.tagText, { color: accentInk }]}>{copy.picked}</Text>
                    </View>
                  ) : yours ? (
                    <View style={[styles.tag, { backgroundColor: accent }]}>
                      <Text style={[styles.tagText, { color: accentInk }]}>{copy.yourTeam}</Text>
                    </View>
                  ) : null}
                </Pressable>
              )
            })}
          </View>
        ) : null,
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: theme.card,
    color: theme.chalk,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.lineSoft,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: font.body,
    fontSize: 16,
  },
  division: {
    color: theme.gold,
    fontFamily: font.display,
    letterSpacing: 1,
    fontSize: 14,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.lineSoft,
    padding: 10,
  },
  logo: { width: 36, height: 36 },
  swatch: { width: 8, height: 32, borderRadius: 2 },
  name: { color: theme.chalk, fontFamily: font.bodyMed, fontSize: 16 },
  sub: { color: theme.faint, fontFamily: font.body, fontSize: 12 },
  record: { color: theme.chalk, fontFamily: font.display, fontSize: 16 },
  pickedBar: { width: 6, alignSelf: 'stretch', borderRadius: 3 },
  tag: { borderRadius: 3, paddingHorizontal: 6, paddingVertical: 2 },
  tagText: { fontFamily: font.display, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase' },
})
