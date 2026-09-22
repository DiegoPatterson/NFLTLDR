import { Link, Stack } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'

import { font, theme } from '@/src/config/theme'

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Missing', headerShown: false }} />
      <View style={styles.container}>
        <Text style={styles.title}>That screen is not on the field.</Text>
        <Link href="/(tabs)/home" style={styles.link}>
          <Text style={styles.linkText}>Back to home</Text>
        </Link>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: theme.bg,
    gap: 12,
  },
  title: { color: theme.chalk, fontFamily: font.display, fontSize: 24, textAlign: 'center' },
  link: { paddingVertical: 12 },
  linkText: { color: theme.gold, fontFamily: font.bodyMed, fontSize: 16 },
})
