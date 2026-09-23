import { useMemo, useState } from 'react'
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native'

import { Card, Muted, Screen, useAccent, useTeamSkin } from '@/src/components/shell'
import { copy } from '@/src/config/copy'
import { plainPlays, playShots, type PlayShot } from '@/src/config/playImages'
import { playbook, type PlayEntry } from '../../src/config/playbook'
import { font, theme } from '@/src/config/theme'
import { fuzzyCutoff, fuzzyScore } from '@/src/logic/fuzzy'

const fields: { key: keyof Pick<PlayEntry, 'how' | 'tell' | 'call' | 'answer'>; label: string }[] = [
  { key: 'how', label: 'How it works' },
  { key: 'tell', label: 'How you know' },
  { key: 'call', label: 'Call it when' },
  { key: 'answer', label: 'If they keep doing it' },
]

export default function PlaybookScreen() {
  const skin = useTeamSkin()
  const [query, setQuery] = useState('')
  const [sectionId, setSectionId] = useState('all')
  const [openId, setOpenId] = useState<string | null>(null)
  const needle = query.trim()

  const shown = useMemo(() => {
    return playbook
      .filter((section) => sectionId === 'all' || section.id === sectionId)
      .map((section) => ({
        ...section,
        plays: section.plays.filter((play) => {
          if (!needle) return true
          const blob = `${play.name} ${play.look} ${play.how} ${play.tell} ${play.call} ${play.answer}`
          return fuzzyScore(needle, play.name) >= fuzzyCutoff || blob.toLowerCase().includes(needle.toLowerCase())
        }),
      }))
      .filter((section) => section.plays.length)
  }, [needle, sectionId])

  return (
    <Screen gear title={copy.playbook}>
      <Muted>{copy.playbookIntro}</Muted>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Slant, cover 2, third and long"
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
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        <Chip label={copy.playbookAll} on={sectionId === 'all'} onPress={() => setSectionId('all')} />
        {playbook.map((section) => (
          <Chip
            key={section.id}
            label={section.title}
            on={sectionId === section.id}
            onPress={() => setSectionId(section.id)}
          />
        ))}
      </ScrollView>
      {shown.map((section) => (
        <View key={section.id} style={{ gap: 8 }}>
          <Text style={{ color: skin.accent, fontFamily: font.display, fontSize: 14, letterSpacing: 1, textTransform: 'uppercase' }}>
            {section.title}
          </Text>
          <Muted>{section.dek}</Muted>
          {section.plays.map((play) => {
            const open = openId === play.id
            return (
              <Pressable
                key={play.id}
                onPress={() => setOpenId(open ? null : play.id)}
                accessibilityRole="button"
                accessibilityState={{ expanded: open }}
                style={({ pressed }) => [{ opacity: pressed ? 0.72 : 1 }]}>
                <Card style={open ? { borderColor: skin.accent, borderWidth: 2 } : undefined}>
                  <Text style={{ color: theme.chalk, fontFamily: font.display, fontSize: 18, letterSpacing: 0.4 }}>
                    {play.name}
                  </Text>
                  <Text style={{ color: skin.accent, fontFamily: font.bodyMed, fontSize: 14 }}>{play.look}</Text>
                  {open ? <PlayPictures id={play.id} /> : null}
                  {open
                    ? fields.map((field) => (
                        <View key={field.key} style={{ gap: 2 }}>
                          <Text style={{ color: theme.faint, fontFamily: font.display, fontSize: 12, letterSpacing: 0.8, textTransform: 'uppercase' }}>
                            {field.label}
                          </Text>
                          <Muted>{play[field.key]}</Muted>
                        </View>
                      ))
                    : null}
                </Card>
              </Pressable>
            )
          })}
        </View>
      ))}
      {!shown.length ? <Muted>{copy.playbookEmpty}</Muted> : null}
    </Screen>
  )
}

function PlayPictures({ id }: { id: string }) {
  const shots = playShots[id]
  if (plainPlays.has(id)) return null
  if (!shots?.length) return <Muted>{copy.playbookNoArt}</Muted>
  return (
    <View style={{ gap: 8 }}>
      {shots.map((shot) => (
        <Shot key={shot.note} shot={shot} />
      ))}
    </View>
  )
}

function Shot({ shot }: { shot: PlayShot }) {
  const [failed, setFailed] = useState(false)
  if (failed) return <Muted>{copy.playbookArtMiss}</Muted>
  return (
    <View style={{ gap: 4 }}>
      <Image
        source={shot.source}
        resizeMode="contain"
        onError={() => setFailed(true)}
        style={{ width: '100%', height: shot.tall ? 320 : 150, backgroundColor: '#F4F1E8', borderRadius: 8 }}
      />
      <Muted>{shot.note}</Muted>
    </View>
  )
}

function Chip({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  const skin = useTeamSkin()
  const { accentInk } = useAccent()
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      style={{
        borderRadius: 99,
        borderWidth: 1,
        borderColor: on ? skin.accent : skin.line,
        backgroundColor: on ? skin.accent : skin.card,
        paddingHorizontal: 12,
        paddingVertical: 6,
      }}>
      <Text style={{ color: on ? accentInk : theme.chalk, fontFamily: font.bodyMed, fontSize: 14 }}>{label}</Text>
    </Pressable>
  )
}
