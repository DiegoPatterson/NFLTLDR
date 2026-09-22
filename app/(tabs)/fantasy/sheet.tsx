import { useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'

import { Card, Muted, Screen, useAccent, useTeamSkin } from '@/src/components/shell'
import { copy } from '@/src/config/copy'
import {
  presets,
  scoringFields,
  slotFields,
  type PresetId,
} from '@/src/config/fantasyPresets'
import { font, theme } from '@/src/config/theme'
import { useApp, type FantasyRules } from '@/src/state/AppState'

export default function SheetScreen() {
  const { profile, setRules } = useApp()
  const { accent, accentInk } = useAccent()
  const skin = useTeamSkin()
  const rules = profile.rules

  function apply(presetId: PresetId) {
    const preset = presets.find((item) => item.id === presetId)
    if (!preset) return
    setRules({
      ...rules,
      name: preset.name,
      presetId: preset.id,
      scoring: { ...preset.scoring },
      slots: { ...preset.slots },
    })
  }

  function patch(next: Partial<FantasyRules>) {
    setRules({ ...rules, ...next, presetId: 'custom' })
  }

  return (
    <Screen back title={copy.customSheet}>
      <Muted>{copy.savedHere}</Muted>
      <Card>
        <Text style={[label, { color: skin.accent }]}>{copy.sheetName}</Text>
        <TextInput
          value={rules.name}
          onChangeText={(name) => patch({ name })}
          style={[input, { borderBottomColor: skin.line }]}
          placeholderTextColor={theme.faint}
        />
      </Card>
      <Text style={[label, { color: skin.accent }]}>{copy.applyPreset}</Text>
      <View style={row}>
        {presets.map((preset) => {
          const on = rules.presetId === preset.id
          return (
            <Pressable
              key={preset.id}
              onPress={() => apply(preset.id)}
              style={[chip, { borderColor: skin.line }, on && { backgroundColor: accent }]}>
              <Text style={[chipText, on && { color: accentInk }]}>{preset.name}</Text>
            </Pressable>
          )
        })}
      </View>
      <Card key={rules.presetId}>
        <Text style={[label, { color: skin.accent }]}>{copy.scoring}</Text>
        <Muted>Points for one of each. Passing yards are usually 0.04, which is 1 point per 25 yards.</Muted>
        {scoringFields.map((field) => (
          <NumberField
            key={field.key}
            label={field.label}
            value={rules.scoring[field.key]}
            onChange={(value) => patch({ scoring: { ...rules.scoring, [field.key]: value } })}
          />
        ))}
      </Card>
      <Card>
        <Text style={[label, { color: skin.accent }]}>{copy.rosterSlots}</Text>
        {slotFields.map((field) => (
          <Stepper
            key={field.key}
            label={field.label}
            value={rules.slots[field.key]}
            onChange={(value) => patch({ slots: { ...rules.slots, [field.key]: value } })}
          />
        ))}
      </Card>
      <Card>
        <Text style={[label, { color: skin.accent }]}>{copy.houseNotes}</Text>
        <TextInput
          value={rules.notes}
          onChangeText={(notes) => patch({ notes })}
          style={[input, { borderBottomColor: skin.line, minHeight: 90, textAlignVertical: 'top' }]}
          multiline
          placeholder="Keeper limits, vetoes, anything the group actually plays by."
          placeholderTextColor={theme.faint}
        />
      </Card>
    </Screen>
  )
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  const [text, setText] = useState(String(value))
  return (
    <View style={fieldRow}>
      <Text style={fieldLabel}>{label}</Text>
      <TextInput
        value={text}
        keyboardType="decimal-pad"
        onChangeText={(next) => {
          setText(next)
          const parsed = Number(next)
          if (next.trim() && Number.isFinite(parsed)) onChange(parsed)
        }}
        onBlur={() => {
          const parsed = Number(text)
          if (!Number.isFinite(parsed)) setText(String(value))
        }}
        style={num}
      />
    </View>
  )
}

function Stepper({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  const { accent } = useAccent()
  return (
    <View style={fieldRow}>
      <Text style={fieldLabel}>{label}</Text>
      <View style={stepRow}>
        <Pressable onPress={() => onChange(Math.max(0, value - 1))} accessibilityRole="button">
          <Text style={[step, { color: accent }]}>–</Text>
        </Pressable>
        <Text style={stepValue}>{value}</Text>
        <Pressable onPress={() => onChange(value + 1)} accessibilityRole="button">
          <Text style={[step, { color: accent }]}>+</Text>
        </Pressable>
      </View>
    </View>
  )
}

const label = { color: theme.gold, fontFamily: font.display, letterSpacing: 1, textTransform: 'uppercase' as const, fontSize: 14 }
const input = {
  color: theme.chalk,
  fontFamily: font.body,
  fontSize: 16,
  borderBottomWidth: 1,
  borderBottomColor: theme.lineSoft,
  paddingVertical: 8,
}
const row = { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 8 }
const chip = { borderWidth: 1, borderColor: theme.lineSoft, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8 }
const chipText = { color: theme.chalk, fontFamily: font.display, letterSpacing: 0.6 }
const fieldRow = { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, gap: 12 }
const fieldLabel = { color: theme.chalk, fontFamily: font.body, fontSize: 15, flex: 1 }
const num = { color: theme.chalk, fontFamily: font.display, fontSize: 18, minWidth: 72, textAlign: 'right' as const }
const stepRow = { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 12 }
const step = { fontFamily: font.display, fontSize: 28, width: 24, textAlign: 'center' as const }
const stepValue = { color: theme.chalk, fontFamily: font.display, fontSize: 20, minWidth: 20, textAlign: 'center' as const }
