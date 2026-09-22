import { useMemo, useState } from 'react'
import { Pressable, Text, TextInput } from 'react-native'

import { Card, Muted, Screen, useTeamSkin } from '@/src/components/shell'
import { copy } from '@/src/config/copy'
import { nflRules } from '../src/config/nflRules'
import { font, theme } from '@/src/config/theme'
import { fuzzyCutoff, fuzzyScore } from '@/src/logic/fuzzy'

export default function RulesScreen() {
  const skin = useTeamSkin()
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const needle = query.trim()
  const shown = useMemo(() => {
    if (!needle) return nflRules
    return nflRules.filter((rule) => {
      const score = Math.max(fuzzyScore(needle, rule.title), fuzzyScore(needle, rule.body), fuzzyScore(needle, rule.result))
      return score >= fuzzyCutoff || rule.title.toLowerCase().includes(needle.toLowerCase())
    })
  }, [needle])

  return (
    <Screen back safeBottom title={copy.nflRules}>
      <Muted>{copy.nflRulesIntro}</Muted>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Holding, catch, overtime"
        placeholderTextColor={theme.faint}
        autoCorrect={false}
        style={{
          color: theme.chalk,
          fontFamily: font.body,
          fontSize: 16,
          backgroundColor: skin.card,
          borderColor: skin.line,
          borderWidth: 1,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 10,
        }}
      />
      {shown.map((rule) => {
        const open = openId === rule.id
        return (
          <Pressable key={rule.id} onPress={() => setOpenId(open ? null : rule.id)} accessibilityRole="button">
            <Card>
              <Text style={{ color: theme.chalk, fontFamily: font.display, fontSize: 18, letterSpacing: 0.4 }}>
                {rule.title}
              </Text>
              <Text style={{ color: skin.accent, fontFamily: font.bodyMed, fontSize: 14 }}>{rule.result}</Text>
              {open ? <Muted>{rule.body}</Muted> : null}
            </Card>
          </Pressable>
        )
      })}
      {!shown.length ? <Muted>{copy.nflRulesEmpty}</Muted> : null}
    </Screen>
  )
}
