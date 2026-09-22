import AsyncStorage from '@react-native-async-storage/async-storage'

type Entry<T> = { at: number; data: T }

const memory = new Map<string, Entry<unknown>>()
const PREFIX = 'footballtldr.cache:'

export async function cached<T>(
  key: string,
  ttlMs: number,
  load: () => Promise<T>,
  force = false,
): Promise<{ data: T; at: number; stale: boolean }> {
  const now = Date.now()
  const hit = memory.get(key) as Entry<T> | undefined
  if (!force && hit && now - hit.at < ttlMs) {
    return { data: hit.data, at: hit.at, stale: false }
  }
  try {
    const data = await load()
    const entry = { at: now, data }
    memory.set(key, entry)
    AsyncStorage.setItem(PREFIX + key, JSON.stringify(entry)).catch(() => undefined)
    return { data, at: now, stale: false }
  } catch (error) {
    if (hit) return { data: hit.data, at: hit.at, stale: true }
    const raw = await AsyncStorage.getItem(PREFIX + key).catch(() => null)
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Entry<T>
        memory.set(key, parsed)
        return { data: parsed.data, at: parsed.at, stale: true }
      } catch {
        /* ignore a broken save */
      }
    }
    throw error
  }
}

export async function clearCache(): Promise<void> {
  memory.clear()
  const keys = await AsyncStorage.getAllKeys()
  const ours = keys.filter((key) => key.startsWith(PREFIX))
  if (ours.length) await AsyncStorage.multiRemove(ours)
}
