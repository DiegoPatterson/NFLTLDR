import { Stack } from 'expo-router'

import { useTeamSkin } from '@/src/components/shell'

export default function FantasyLayout() {
  const skin = useTeamSkin()
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: skin.bg } }} />
}
