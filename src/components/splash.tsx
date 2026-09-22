import { useEffect, useRef } from 'react'
import { Animated, Easing, Image, Pressable, StyleSheet, Text, View } from 'react-native'

import { AppBadge, useTeamSkin } from '@/src/components/shell'
import { useApp } from '@/src/state/AppState'
import { brand } from '@/src/config/brand'
import { copy } from '@/src/config/copy'
import { font, theme } from '@/src/config/theme'
import { withAlpha } from '@/src/logic/color'

export function SplashView({ onDone }: { onDone: () => void }) {
  const { ready } = useApp()
  const skin = useTeamSkin()
  const drift = useRef(new Animated.Value(0)).current
  const fade = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!ready) return
    const motion = Animated.loop(
      Animated.timing(drift, {
        toValue: 1,
        duration: 2800,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    )
    motion.start()
    Animated.timing(fade, { toValue: 1, duration: 700, useNativeDriver: true }).start()
    const timer = setTimeout(onDone, brand.splashMs)
    return () => {
      motion.stop()
      clearTimeout(timer)
    }
  }, [drift, fade, onDone, ready])

  const shift = drift.interpolate({ inputRange: [0, 1], outputRange: [0, -48] })
  const line = skin.themed ? withAlpha(skin.accent, 0.35) : 'rgba(226,193,107,0.28)'

  return (
    <Pressable
      style={[styles.fill, { backgroundColor: skin.bg }]}
      onPress={ready ? onDone : undefined}
      accessibilityRole="button"
      accessibilityLabel={copy.skip}>
      <View style={styles.lines} pointerEvents="none">
        {[0, 1, 2, 3, 4, 5, 6].map((row) => (
          <Animated.View key={row} style={[styles.yard, { backgroundColor: line, top: 70 + row * 78, transform: [{ translateX: shift }] }]} />
        ))}
      </View>
      <Animated.View style={{ opacity: fade, alignItems: 'center', gap: 14 }}>
        {brand.useCustomLogo ? (
          <Image source={brand.logo} style={styles.logo} resizeMode="contain" />
        ) : (
          <AppBadge size={168} crest />
        )}
        <Text style={styles.name}>{brand.name}</Text>
        {skin.nick ? <Text style={[styles.nick, { color: skin.accent }]}>{skin.nick}</Text> : null}
        <Text style={[styles.tag, { color: skin.themed ? skin.accent : theme.gold }]}>{brand.tagline}</Text>
        <Text style={[styles.skip, { color: skin.faint }]}>{ready ? copy.skip : copy.loadingField}</Text>
      </Animated.View>
      {skin.themed ? (
        <View style={styles.stripe}>
          <View style={{ flex: 1, backgroundColor: skin.field }} />
          <View style={{ flex: 1, backgroundColor: skin.accent }} />
        </View>
      ) : null}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  fill: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  lines: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, overflow: 'hidden' },
  yard: {
    position: 'absolute',
    left: -40,
    right: -80,
    height: 2,
  },
  logo: { width: 168, height: 168 },
  name: {
    color: theme.chalk,
    fontFamily: font.display,
    fontSize: 42,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  nick: { fontFamily: font.display, fontSize: 22, letterSpacing: 2, textTransform: 'uppercase', marginTop: -8 },
  tag: { fontFamily: font.bodyMed, fontSize: 16, letterSpacing: 0.4 },
  skip: { fontFamily: font.body, fontSize: 13, marginTop: 18 },
  stripe: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 10, flexDirection: 'row' },
})
