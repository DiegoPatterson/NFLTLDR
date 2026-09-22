import { useEffect, useRef, useState } from 'react'
import { Animated, Easing, StyleSheet, Text, View } from 'react-native'

import { useTeamSkin } from '@/src/components/shell'
import { features } from '@/src/config/features'
import { font } from '@/src/config/theme'

export function NewsTicker({ items }: { items: string[] }) {
  const [width, setWidth] = useState(0)
  const travel = useRef(new Animated.Value(0)).current
  const text = items.filter(Boolean).slice(0, 8).join('    ·    ')

  useEffect(() => {
    if (!features.ticker || !text || width <= 0) return
    travel.setValue(0)
    const animation = Animated.loop(
      Animated.timing(travel, {
        toValue: -width,
        duration: Math.max(9000, width * 16),
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    )
    animation.start()
    return () => animation.stop()
  }, [text, travel, width])

  const skin = useTeamSkin()
  if (!features.ticker || !text) return null

  return (
    <View style={[styles.bar, { backgroundColor: skin.headerBg, borderBottomColor: skin.line }]}>
      <Animated.View style={[styles.row, { transform: [{ translateX: travel }] }]}>
        {[0, 1].map((copy) => (
          <Text
            key={copy}
            style={[styles.text, { color: skin.accent }]}
            onLayout={copy === 0 ? (event) => setWidth(event.nativeEvent.layout.width) : undefined}>
            {text}
            {'    ·    '}
          </Text>
        ))}
      </Animated.View>
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
  row: { flexDirection: 'row', alignItems: 'center' },
  text: {
    color: '#E2C16B',
    fontFamily: font.bodyMed,
    fontSize: 13,
    letterSpacing: 0.3,
  },
})
