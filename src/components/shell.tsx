import { router } from 'expo-router'
import { useState, type ReactNode } from 'react'
import {
  Image,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { brand } from '@/src/config/brand'
import { copy } from '@/src/config/copy'
import { nflTeams } from '@/src/config/nflTeams'
import { font, theme } from '@/src/config/theme'
import { glossary } from '@/src/config/statCatalog'
import { officialLogo } from '@/src/config/logos'
import { teamBrand, teamColorOverrides } from '@/src/config/teamColors'
import { inkOn, mix, withAlpha } from '@/src/logic/color'
import { useApp } from '@/src/state/AppState'

export type TeamSkin = {
  themed: boolean
  abbr: string | null
  nick: string | null
  bg: string
  card: string
  card2: string
  line: string
  accent: string
  accentInk: string
  field: string
  headerBg: string
  /** Body copy that must stay readable on a team field. Not the old turf green. */
  muted: string
  faint: string
}

const plainSkin = (): TeamSkin => ({
  themed: false,
  abbr: null,
  nick: null,
  bg: theme.bg,
  card: theme.card,
  card2: theme.card2,
  line: theme.lineSoft,
  accent: theme.gold,
  accentInk: theme.black,
  field: theme.bg,
  headerBg: theme.bg,
  muted: theme.muted,
  faint: theme.faint,
})

/** The whole chrome. On, the app is dyed with the followed club. Off, turf and gold. */
export function useTeamSkin(): TeamSkin {
  const { profile } = useApp()
  const team = nflTeams.find((item) => item.id === profile.primaryTeamId)
  if (!team || profile.useTeamColors === false) return plainSkin()
  const brand = { ...teamBrand[team.abbr], ...teamColorOverrides[team.abbr] }
  const field = brand.field || team.color
  const accent = brand.accent || team.alt
  const night = '#07080C'
  return {
    themed: true,
    abbr: team.abbr,
    nick: team.name.split(' ').slice(-1)[0] ?? team.abbr,
    bg: mix(field, night, 0.4),
    card: mix(field, '#12151C', 0.32),
    card2: mix(field, '#1A1E28', 0.22),
    line: withAlpha(accent, 0.85),
    accent,
    accentInk: inkOn(accent),
    field,
    headerBg: mix(field, night, 0.22),
    muted: 'rgba(244,241,232,0.78)',
    faint: 'rgba(244,241,232,0.55)',
  }
}

export function useAccent() {
  const skin = useTeamSkin()
  return { accent: skin.accent, accentInk: skin.accentInk, wash: skin.headerBg, rule: skin.accent }
}

export function Logo({ abbr, size }: { abbr: string; size: number }) {
  const [failed, setFailed] = useState(false)
  if (!abbr || failed) {
    return <View style={{ width: size, height: size, borderRadius: 4, backgroundColor: theme.card2 }} />
  }
  return (
    <Image
      source={{ uri: officialLogo(abbr) }}
      style={{ width: size, height: size }}
      resizeMode="contain"
      onError={() => setFailed(true)}
      accessibilityIgnoresInvertColors
    />
  )
}

export function Frame({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.frame, style]}>{children}</View>
}

export function Screen({
  title,
  back,
  gear,
  banner,
  refreshing,
  onRefresh,
  children,
  footer,
  dock,
  safeBottom,
}: {
  title?: string
  back?: boolean
  gear?: boolean
  banner?: string | null
  refreshing?: boolean
  onRefresh?: () => void
  children: ReactNode
  footer?: ReactNode
  dock?: ReactNode
  safeBottom?: boolean
}) {
  const skin = useTeamSkin()
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: skin.bg }]} edges={safeBottom ? ['top', 'bottom', 'left', 'right'] : ['top', 'left', 'right']}>
      <Frame style={{ backgroundColor: skin.bg }}>
        <AppHeader title={title} back={back} gear={gear} />
        {banner ? <Banner text={banner} /> : null}
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={
            onRefresh ? (
              <RefreshControl refreshing={Boolean(refreshing)} onRefresh={onRefresh} tintColor={skin.accent} colors={[skin.accent]} />
            ) : undefined
          }>
          {children}
          {footer}
        </ScrollView>
        {dock ? <View style={[styles.dock, { backgroundColor: skin.bg, borderTopColor: skin.line }]}>{dock}</View> : null}
      </Frame>
    </SafeAreaView>
  )
}

export function AppHeader({ title, back, gear }: { title?: string; back?: boolean; gear?: boolean }) {
  const skin = useTeamSkin()
  const shown = title ?? skin.nick ?? brand.name
  return (
    <View style={{ backgroundColor: skin.headerBg }}>
      <View style={styles.header}>
        <View style={styles.headerSide}>
          {back ? (
            <Pressable onPress={() => router.back()} hitSlop={8} accessibilityRole="button" accessibilityLabel={copy.back}>
              <Text style={[styles.headerAction, { color: skin.accent }]}>{copy.back}</Text>
            </Pressable>
          ) : skin.abbr ? (
            <Logo abbr={skin.abbr} size={32} />
          ) : (
            <FootballMark size={26} />
          )}
        </View>
        <View style={styles.headerCenter}>
          {skin.nick && title ? <Text style={[styles.kicker, { color: skin.accent }]}>{skin.nick}</Text> : null}
          <Text style={styles.headerTitle} numberOfLines={1}>
            {shown}
          </Text>
        </View>
        <View style={[styles.headerSide, styles.headerEnd]}>
          {gear ? (
            <Pressable
              onPress={() => router.push('/settings')}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={copy.gearLabel}>
              <Text style={[styles.headerAction, { color: skin.accent }]}>{copy.settingsShort}</Text>
            </Pressable>
          ) : (
            skin.abbr && back ? <Logo abbr={skin.abbr} size={28} /> : null
          )}
        </View>
      </View>
      {skin.themed ? (
        <View style={styles.stripe}>
          <View style={{ flex: 1, backgroundColor: skin.field }} />
          <View style={{ flex: 1, backgroundColor: skin.accent }} />
        </View>
      ) : null}
    </View>
  )
}

export function FootballMark({ size = 36 }: { size?: number }) {
  const lace = Math.max(2, Math.round(size * 0.045))
  return (
    <View style={{ width: size, height: size * 0.72, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: size * 0.92,
          height: size * 0.58,
          borderRadius: size,
          backgroundColor: '#7A3E1D',
          borderWidth: Math.max(1, size * 0.035),
          borderColor: '#F4E4C4',
          transform: [{ rotate: '-28deg' }],
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <View style={{ width: lace, height: '78%', backgroundColor: theme.chalk, borderRadius: lace }} />
        <View style={{ position: 'absolute', width: '42%', height: lace, backgroundColor: theme.chalk, borderRadius: lace }} />
        <View style={{ position: 'absolute', width: '42%', height: lace, backgroundColor: theme.chalk, borderRadius: lace, transform: [{ translateY: -size * 0.1 }] }} />
        <View style={{ position: 'absolute', width: '42%', height: lace, backgroundColor: theme.chalk, borderRadius: lace, transform: [{ translateY: size * 0.1 }] }} />
      </View>
    </View>
  )
}

/** The app mark, framed in the followed club's two colors. Plain gold and turf until a team is chosen. */
export function AppBadge({ size = 72, crest = false }: { size?: number; crest?: boolean }) {
  const skin = useTeamSkin()
  const field = skin.themed ? skin.field : '#10281C'
  const accent = skin.themed ? skin.accent : theme.gold
  const radius = Math.round(size * 0.24)
  const band = Math.max(3, Math.round(size * 0.07))
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        backgroundColor: field,
        borderWidth: band,
        borderColor: accent,
        alignItems: 'center',
        justifyContent: 'center',
        }}>
      <Image
        source={brand.mark}
        style={{ width: size * 0.86, height: size * 0.86 }}
        resizeMode="contain"
      />
      {crest && skin.abbr ? (
        <View style={{ position: 'absolute', top: size * 0.08, right: size * 0.08, backgroundColor: '#07140F', borderRadius: size, padding: 2 }}>
          <Logo abbr={skin.abbr} size={size * 0.26} />
        </View>
      ) : null}
      </View>
  )
}

export function Banner({ text }: { text: string }) {
  const skin = useTeamSkin()
  return (
    <View style={[styles.banner, { backgroundColor: skin.card2, borderColor: skin.line }]}>
      <Text style={[styles.bannerText, { color: skin.accent }]}>{text}</Text>
    </View>
  )
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const skin = useTeamSkin()
  return <View style={[styles.card, { backgroundColor: skin.card, borderColor: skin.line }, style]}>{children}</View>
}

export function Display({ children, size = 28 }: { children: ReactNode; size?: number }) {
  return <Text style={[styles.display, { fontSize: size, lineHeight: size + 4 }]}>{children}</Text>
}

export function Muted({ children }: { children: ReactNode }) {
  const skin = useTeamSkin()
  return <Text style={[styles.muted, { color: skin.muted }]}>{children}</Text>
}

export function ActionButton({ label, onPress }: { label: string; onPress: () => void }) {
  const { accent, accentInk } = useAccent()
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.button, { backgroundColor: accent, opacity: pressed ? 0.85 : 1 }]}>
      <Text style={[styles.buttonText, { color: accentInk }]}>{label}</Text>
    </Pressable>
  )
}

export function GlossaryValue({
  label,
  value,
  glossaryId,
  align = 'left',
}: {
  label: string
  value: string
  glossaryId?: string
  align?: 'left' | 'right'
}) {
  const note = glossaryId ? glossary[glossaryId] : undefined
  return (
    <View style={{ alignItems: align === 'right' ? 'flex-end' : 'flex-start' }}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {note ? <Text style={styles.gloss}>{note}</Text> : null}
    </View>
  )
}

export function updatedLabel(at?: number): string | null {
  if (!at) return null
  const clock = new Date(at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  return `${copy.updated} ${clock}`
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  frame: {
    flex: 1,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    backgroundColor: theme.bg,
  },
  scroll: { padding: 16, paddingBottom: 36, gap: 12 },
  dock: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.lineSoft,
    backgroundColor: theme.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'web' ? 12 : 4,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.lineSoft,
  },
  headerSide: { width: 72 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerEnd: { alignItems: 'flex-end' },
  kicker: { fontFamily: font.display, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase' },
  stripe: { flexDirection: 'row', height: 8 },
  headerTitle: {
    textAlign: 'center',
    color: theme.chalk,
    fontFamily: font.display,
    fontSize: 20,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  headerAction: {
    fontFamily: font.display,
    fontSize: 14,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  banner: {
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 4,
    borderWidth: 1,
  },
  bannerText: { color: theme.gold, fontFamily: font.body, fontSize: 13 },
  card: {
    backgroundColor: theme.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.lineSoft,
    padding: 14,
    gap: 8,
  },
  display: { color: theme.chalk, fontFamily: font.display, letterSpacing: 0.5 },
  muted: { color: theme.muted, fontFamily: font.body, fontSize: 14, lineHeight: 20 },
  button: { borderRadius: 6, paddingVertical: 14, alignItems: 'center' },
  buttonText: { fontFamily: font.display, fontSize: 16, letterSpacing: 1.2, textTransform: 'uppercase' },
  statValue: { color: theme.chalk, fontFamily: font.display, fontSize: 22 },
  statLabel: { color: theme.faint, fontFamily: font.bodyMed, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase' },
  gloss: { color: theme.muted, fontFamily: font.body, fontSize: 12, lineHeight: 16, marginTop: 2 },
})
