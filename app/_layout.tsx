import { Barlow_400Regular, Barlow_500Medium, Barlow_600SemiBold } from '@expo-google-fonts/barlow'
import { Oswald_500Medium, Oswald_600SemiBold } from '@expo-google-fonts/oswald'
import { useFonts } from 'expo-font'
import { router, Stack, useSegments } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { SplashView } from '@/src/components/splash'
import { useTeamSkin } from '@/src/components/shell'
import { AppProvider, useApp } from '@/src/state/AppState'

export { ErrorBoundary } from 'expo-router'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Oswald: Oswald_500Medium,
    OswaldSemi: Oswald_600SemiBold,
    Barlow: Barlow_400Regular,
    BarlowMed: Barlow_500Medium,
    BarlowSemi: Barlow_600SemiBold,
  })

  useEffect(() => {
    if (error) throw error
  }, [error])

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync().catch(() => undefined)
  }, [loaded])

  if (!loaded) return null

  return (
    <AppProvider>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Gate />
      </SafeAreaProvider>
    </AppProvider>
  )
}

function Gate() {
  const { ready, profile, splashDone, finishSplash } = useApp()
  const skin = useTeamSkin()
  const segments = useSegments()

  useEffect(() => {
    if (!ready) return
    if (!profile.primaryTeamId && segments[0] !== 'onboarding') {
      router.replace('/onboarding')
    }
  }, [profile.primaryTeamId, ready, segments])

  return (
    <View style={{ flex: 1, backgroundColor: skin.bg }}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: skin.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="team/[id]" />
        <Stack.Screen name="game/[id]" />
        <Stack.Screen name="player/[id]" />
        <Stack.Screen name="rules" />
      </Stack>
      {!splashDone ? <SplashView onDone={finishSplash} /> : null}
    </View>
  )
}
