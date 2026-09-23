import { useEffect, useRef, useState } from 'react'
import { Animated, Easing, StyleSheet, Text, View } from 'react-native'

import { useTeamSkin } from '@/src/components/shell'
import { features } from '@/src/config/features'
import { font } from '@/src/config/theme'

export function NewsTicker({ items }: { items: string[] }) {
  const skin = useTeamSkin()
  const travel = useRef(new Animated.Value(0)).current
  const [width, setWidth] = useState(0)
  const seen = new Set<string>()
  const text = items
    .map((item) => item.trim())
    .filter((item) => {
      if (!item || seen.has(item)) return false
      seen.add(item)
      return true
    })
    .slice(0, 8)
    .join('    ·    ')
  const line = text ? `${text}    ·    ` : ''

  useEffect(() => {
    if (!features.ticker || !line || width <= 0) return
    travel.setValue(0)
    const animation = Animated.loop(
      Animated.timing(travel, {
        toValue: -width,
        duration: Math.max(14000, width * 22),
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    )
    animation.start()
    return () => animation.stop()
  }, [line, travel, width])

  if (!features.ticker || !line) return null

  return (
    <View style={[styles.bar, { backgroundColor: skin.headerBg, borderBottomColor: skin.line }]}>
      <Text
        style={[styles.text, styles.measure, { color: skin.accent }]}
        onLayout={(event) => {
          const next = event.nativeEvent.layout.width
          setWidth((current) => (Math.abs(current - next) < 1 ? current : next))
        }}>
        {line}
      </Text>
      {width > 0 ? (
        <Animated.View style={[styles.track, { width: width * 2, transform: [{ translateX: travel }] }]}>
          <Text key="a" style={[styles.text, { width, color: skin.accent }]} numberOfLines={1}>
            {line}
          </Text>
          <Text key="b" style={[styles.text, { width, color: skin.accent }]} numberOfLines={1}>
            {line}
          </Text>
        </Animated.View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    height: 32,
    overflow: 'hidden',
    backgroundColor: '#10261A',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'transparent',
    justifyContent: 'center',
  },
  track: { flexDirection: 'row', alignItems: 'center' },
  measure: { position: 'absolute', opacity: 0, left: 0, top: 0 },
  text: {
    color: '#E2C16B',
    fontFamily: font.bodyMed,
    fontSize: 14,
    lineHeight: 18,
    flexShrink: 0,
  },
})
