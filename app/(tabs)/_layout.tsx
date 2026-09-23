import { Tabs } from 'expo-router'
import { StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { NavIcon } from '@/src/components/navIcons'
import { useTeamSkin } from '@/src/components/shell'
import { copy } from '@/src/config/copy'
import { theme } from '@/src/config/theme'

export default function TabLayout() {
  const skin = useTeamSkin()
  const insets = useSafeAreaInsets()
  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: skin.accent,
        tabBarInactiveTintColor: theme.faint,
        tabBarStyle: {
          backgroundColor: skin.bg,
          borderTopColor: skin.accent,
          borderTopWidth: skin.themed ? 2 : StyleSheet.hairlineWidth,
          // The library already pads for the home indicator. A fixed 58px height
          // ate that padding on a phone and clipped the old labels.
          height: 56 + insets.bottom,
          paddingTop: 6,
        },
      }}>
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen
        name="home"
        options={{
          title: copy.home,
          tabBarAccessibilityLabel: copy.home,
          tabBarIcon: ({ color }) => <NavIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="league"
        options={{
          title: copy.league,
          tabBarAccessibilityLabel: copy.league,
          tabBarIcon: ({ color }) => <NavIcon name="league" color={color} />,
        }}
      />
      <Tabs.Screen
        name="playbook"
        options={{
          title: copy.playbook,
          tabBarAccessibilityLabel: copy.playbook,
          tabBarIcon: ({ color }) => <NavIcon name="playbook" color={color} />,
        }}
      />
      <Tabs.Screen
        name="rules"
        options={{
          title: copy.nflRules,
          tabBarAccessibilityLabel: copy.nflRules,
          tabBarIcon: ({ color }) => <NavIcon name="rules" color={color} />,
        }}
      />
    </Tabs>
  )
}
