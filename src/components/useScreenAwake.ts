import { useIsFocused } from 'expo-router'
import { useEffect, useState } from 'react'
import { AppState } from 'react-native'

/** True only while this screen is open and the phone is unlocked. */
export function useScreenAwake(): boolean {
  const focused = useIsFocused()
  const [active, setActive] = useState(AppState.currentState === 'active')
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => setActive(state === 'active'))
    return () => sub.remove()
  }, [])
  return focused && active
}
