import AsyncStorage from '@react-native-async-storage/async-storage'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import { defaultPreset, type PresetId, type RosterSlots, type Scoring } from '@/src/config/fantasyPresets'
import { emptyFocus, pinGame, type FocusMemory } from '@/src/logic/focus'
import { legalSlots, nextSlot, type SlotKey } from '@/src/logic/lineup'
import type { PlayerCard } from '@/src/data/types'

const KEY = 'footballtldr.profile.v1'

export type Punishment = {
  id: string
  who: string
  what: string
  week: string
  done: boolean
}

export type FantasyRules = {
  name: string
  presetId: PresetId
  notes: string
  scoring: Scoring
  slots: RosterSlots
}

export type RosterEntry = PlayerCard & { slot: SlotKey }

export type Profile = {
  primaryTeamId: string | null
  /** When true, chrome uses the followed team's colors. Logos and scores do not change. */
  useTeamColors: boolean
  focus: FocusMemory
  rules: FantasyRules
  punishments: Punishment[]
  roster: RosterEntry[]
  watchedPlayers: PlayerCard[]
  watchedTeamIds: string[]
}

const defaultProfile = (): Profile => ({
  primaryTeamId: null,
  useTeamColors: true,
  focus: emptyFocus,
  rules: {
    name: defaultPreset.name,
    presetId: defaultPreset.id,
    notes: '',
    scoring: { ...defaultPreset.scoring },
    slots: { ...defaultPreset.slots },
  },
  punishments: [],
  roster: [],
  watchedPlayers: [],
  watchedTeamIds: [],
})

type AppContextValue = {
  ready: boolean
  splashDone: boolean
  finishSplash: () => void
  profile: Profile
  setPrimaryTeam: (id: string) => void
  setUseTeamColors: (on: boolean) => void
  setFocus: (focus: FocusMemory | ((current: FocusMemory) => FocusMemory)) => void
  pin: (gameId: string) => void
  setRules: (rules: FantasyRules) => void
  addPunishment: (entry: Omit<Punishment, 'id' | 'done'>) => void
  togglePunishment: (id: string) => void
  removePunishment: (id: string) => void
  addPlayer: (player: PlayerCard) => string | null
  removePlayer: (id: string) => void
  watchPlayer: (player: PlayerCard) => void
  unwatchPlayer: (id: string) => void
  watchTeam: (id: string) => void
  unwatchTeam: (id: string) => void
}

const AppContext = createContext<AppContextValue | null>(null)

function sanitize(raw: unknown): Profile {
  const base = defaultProfile()
  if (!raw || typeof raw !== 'object') return base
  const value = raw as Partial<Profile>
  return {
    primaryTeamId: typeof value.primaryTeamId === 'string' ? value.primaryTeamId : null,
    useTeamColors: value.useTeamColors !== false,
    focus: {
      focusedGameId: value.focus?.focusedGameId ?? null,
      userPinnedGameId: value.focus?.userPinnedGameId ?? null,
      autoPromotedIds: Array.isArray(value.focus?.autoPromotedIds)
        ? value.focus.autoPromotedIds.filter((id) => typeof id === 'string')
        : [],
    },
    rules: value.rules?.scoring && value.rules.slots ? { ...base.rules, ...value.rules } : base.rules,
    punishments: Array.isArray(value.punishments) ? value.punishments : [],
    roster: placeRoster(Array.isArray(value.roster) ? value.roster : [], base.rules.slots),
    watchedPlayers: Array.isArray(value.watchedPlayers) ? value.watchedPlayers.filter(isCard) : [],
    watchedTeamIds: Array.isArray(value.watchedTeamIds)
      ? value.watchedTeamIds.filter((id) => typeof id === 'string')
      : [],
  }
}

function isCard(value: unknown): value is PlayerCard {
  if (!value || typeof value !== 'object') return false
  const card = value as PlayerCard
  return typeof card.id === 'string' && typeof card.name === 'string'
}

function placeRoster(raw: unknown[], limits: RosterSlots): RosterEntry[] {
  const placed: RosterEntry[] = []
  for (const item of raw) {
    if (!isCard(item)) continue
    const savedSlot = (item as RosterEntry).slot
    const legal = legalSlots(item.position || '')
    let slot: SlotKey | null = legal.includes(savedSlot) ? savedSlot : null
    if (slot && placed.filter((entry) => entry.slot === slot).length >= limits[slot]) slot = null
    if (!slot) slot = nextSlot(item.position || '', placed, limits)
    if (!slot) continue
    placed.push({
      ...item,
      position: item.position || '',
      active: item.active !== false,
      stats: item.stats ?? {},
      numbers: item.numbers ?? {},
      slot,
    })
  }
  return placed
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [splashDone, setSplashDone] = useState(false)
  const [profile, setProfile] = useState<Profile>(defaultProfile)

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) setProfile(sanitize(JSON.parse(raw)))
      })
      .catch(() => undefined)
      .finally(() => setReady(true))
  }, [])

  const finishSplash = useCallback(() => setSplashDone(true), [])

  const update = useCallback(
    (recipe: (current: Profile) => Profile) => {
      setProfile((current) => {
        const next = recipe(current)
        AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => undefined)
        return next
      })
    },
    [],
  )

  const value = useMemo<AppContextValue>(
    () => ({
      ready,
      splashDone,
      finishSplash,
      profile,
      setPrimaryTeam: (id) => update((current) => ({ ...current, primaryTeamId: id })),
      setUseTeamColors: (on: boolean) => update((current) => ({ ...current, useTeamColors: on })),
      setFocus: (focus) =>
        update((current) => ({
          ...current,
          focus: typeof focus === 'function' ? focus(current.focus) : focus,
        })),
      pin: (gameId) => update((current) => ({ ...current, focus: pinGame(current.focus, gameId) })),
      setRules: (rules) => update((current) => ({ ...current, rules })),
      addPunishment: (entry) =>
        update((current) => ({
          ...current,
          punishments: [{ ...entry, id: `${Date.now()}`, done: false }, ...current.punishments],
        })),
      togglePunishment: (id) =>
        update((current) => ({
          ...current,
          punishments: current.punishments.map((item) => (item.id === id ? { ...item, done: !item.done } : item)),
        })),
      removePunishment: (id) =>
        update((current) => ({ ...current, punishments: current.punishments.filter((item) => item.id !== id) })),
      addPlayer: (player) => {
        if (!player.active) return 'Only active players can go on the sheet.'
        if (profile.roster.some((item) => item.id === player.id)) return 'Already on the sheet.'
        const slot = nextSlot(player.position, profile.roster, profile.rules.slots)
        if (!slot) {
          return legalSlots(player.position).length
            ? `No open spot for a ${player.position}.`
            : `${player.position || 'That position'} is not on this sheet.`
        }
        update((current) => {
          if (current.roster.some((item) => item.id === player.id)) return current
          const open = nextSlot(player.position, current.roster, current.rules.slots)
          if (!open) return current
          return { ...current, roster: [...current.roster, { ...player, slot: open }] }
        })
        return null
      },
      removePlayer: (id) => update((current) => ({ ...current, roster: current.roster.filter((item) => item.id !== id) })),
      watchPlayer: (player) =>
        update((current) => ({
          ...current,
          watchedPlayers: current.watchedPlayers.some((item) => item.id === player.id)
            ? current.watchedPlayers.map((item) => (item.id === player.id ? player : item))
            : [player, ...current.watchedPlayers],
        })),
      unwatchPlayer: (id) =>
        update((current) => ({ ...current, watchedPlayers: current.watchedPlayers.filter((item) => item.id !== id) })),
      watchTeam: (id) =>
        update((current) => ({
          ...current,
          watchedTeamIds: current.watchedTeamIds.includes(id) ? current.watchedTeamIds : [...current.watchedTeamIds, id],
        })),
      unwatchTeam: (id) =>
        update((current) => ({ ...current, watchedTeamIds: current.watchedTeamIds.filter((item) => item !== id) })),
    }),
    [finishSplash, profile, ready, splashDone, update],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const value = useContext(AppContext)
  if (!value) throw new Error('useApp must be used inside AppProvider')
  return value
}

