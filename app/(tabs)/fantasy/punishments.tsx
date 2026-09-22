import { useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'

import { ActionButton, Card, Muted, Screen, useAccent, useTeamSkin } from '@/src/components/shell'
import { copy } from '@/src/config/copy'
import { font, theme } from '@/src/config/theme'
import { useApp } from '@/src/state/AppState'

export default function PunishmentsScreen() {
  const { profile, addPunishment, togglePunishment, removePunishment } = useApp()
  const [who, setWho] = useState('')
  const [what, setWhat] = useState('')
  const [week, setWeek] = useState('')
  const ready = who.trim().length > 0 && what.trim().length > 0

  return (
    <Screen back title={copy.punishments}>
      <Card>
        <Field label={copy.who} value={who} onChange={setWho} />
        <Field label={copy.owes} value={what} onChange={setWhat} />
        <Field label={copy.week} value={week} onChange={setWeek} placeholder="Week 4" />
        {ready ? (
          <ActionButton
            label={copy.addPunishment}
            onPress={() => {
              addPunishment({ who: who.trim(), what: what.trim(), week: week.trim() })
              setWho('')
              setWhat('')
              setWeek('')
            }}
          />
        ) : (
          <Muted>Name the person and what they owe.</Muted>
        )}
      </Card>
      {!profile.punishments.length ? <Muted>{copy.emptyPunishments}</Muted> : null}
      {profile.punishments.map((item) => (
        <PunishmentRow
          key={item.id}
          who={item.who}
          what={item.what}
          week={item.week}
          done={item.done}
          onToggle={() => togglePunishment(item.id)}
          onRemove={() => removePunishment(item.id)}
        />
      ))}
    </Screen>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  const skin = useTeamSkin()
  return (
    <View style={{ gap: 4 }}>
      <Text style={kicker}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={theme.faint}
        style={[input, { borderBottomColor: skin.line }]}
      />
    </View>
  )
}

function PunishmentRow({
  who,
  what,
  week,
  done,
  onToggle,
  onRemove,
}: {
  who: string
  what: string
  week: string
  done: boolean
  onToggle: () => void
  onRemove: () => void
}) {
  const { accent } = useAccent()
  return (
    <Card>
      <Text style={[whoStyle, done && { color: theme.faint, textDecorationLine: 'line-through' }]}>{who}</Text>
      <Text style={whatStyle}>{what}</Text>
      {week ? <Text style={[weekStyle, { color: accent }]}>{week}</Text> : null}
      <View style={actions}>
        <Pressable onPress={onToggle} accessibilityRole="button">
          <Text style={[action, { color: accent }]}>{done ? copy.markOpen : copy.markDone}</Text>
        </Pressable>
        <Pressable onPress={onRemove} accessibilityRole="button">
          <Text style={action}>{copy.remove}</Text>
        </Pressable>
      </View>
    </Card>
  )
}

const kicker = { color: theme.faint, fontFamily: font.display, letterSpacing: 1, textTransform: 'uppercase' as const, fontSize: 12 }
const input = { color: theme.chalk, fontFamily: font.body, fontSize: 16, borderBottomWidth: 1, borderBottomColor: theme.lineSoft, paddingVertical: 6 }
const whoStyle = { color: theme.chalk, fontFamily: font.display, fontSize: 20 }
const whatStyle = { color: theme.chalk, fontFamily: font.body, fontSize: 15 }
const weekStyle = { color: theme.gold, fontFamily: font.bodyMed, fontSize: 13 }
const actions = { flexDirection: 'row' as const, gap: 16 }
const action = { color: theme.muted, fontFamily: font.display, letterSpacing: 0.8, textTransform: 'uppercase' as const, fontSize: 13 }
