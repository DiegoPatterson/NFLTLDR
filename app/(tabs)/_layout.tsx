import { Tabs } from 'expo-router'
import { StyleSheet } from 'react-native'

import { copy } from '@/src/config/copy'
import { font, theme } from '@/src/config/theme'
import { useTeamSkin } from '@/src/components/shell'

export default function TabLayout() {
  const skin = useTeamSkin()
  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: skin.accent,
        tabBarInactiveTintColor: theme.faint,
        tabBarStyle: {
          backgroundColor: skin.bg,
          borderTopColor: skin.accent,
          borderTopWidth: skin.themed ? 2 : StyleSheet.hairlineWidth,
          height: 58,
        },
        tabBarLabelStyle: {
          fontFamily: font.display,
          fontSize: 13,
          letterSpacing: 1.1,
          textTransform: 'uppercase',
          marginBottom: 8,
        },
      }}>
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="home" options={{ title: copy.home }} />
      <Tabs.Screen name="league" options={{ title: copy.league }} />
      <Tabs.Screen name="watch" options={{ title: copy.watch }} />
      <Tabs.Screen name="fantasy" options={{ title: copy.fantasy }} />
    </Tabs>
  )
}
