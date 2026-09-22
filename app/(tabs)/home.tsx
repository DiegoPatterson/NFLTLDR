import { router } from 'expo-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Text, View } from 'react-native'

import { GameStrip, LiveBoard, MatchupCard } from '@/src/components/board'
import { TeamDigest, YourClubCard } from '@/src/components/digest'
import { Muted, Screen, updatedLabel, useTeamSkin } from '@/src/components/shell'
import { NewsTicker } from '@/src/components/ticker'
import { copy } from '@/src/config/copy'
import { features } from '@/src/config/features'
import { newsRules } from '@/src/config/newsRules'
import { font, theme } from '@/src/config/theme'
import type { Article, Digest, GameDetail, SlateGame } from '@/src/data/types'
import { getDigest, getGameDetail, getNews, getSlate } from '@/src/data/repository'
import { resolveFocus } from '@/src/logic/focus'
import { useApp } from '@/src/state/AppState'

export default function HomeScreen() {
  const { ready, profile, setFocus, pin } = useApp()
  const skin = useTeamSkin()
  const teamId = profile.primaryTeamId
  const [slate, setSlate] = useState<SlateGame[] | null>(null)
  const [detail, setDetail] = useState<GameDetail | null>(null)
  const [digest, setDigest] = useState<Digest | null>(null)
  const [news, setNews] = useState<Article[]>([])
  const [stale, setStale] = useState(false)
  const [failed, setFailed] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [updatedAt, setUpdatedAt] = useState<number | undefined>(undefined)
  const flashes = useScoreFlashes(slate ?? [])

  const load = useCallback(
    async (force = false) => {
      const jobs: Promise<unknown>[] = [
        getSlate(force)
          .then((result) => {
            setSlate(result.data)
            setUpdatedAt(result.at)
            setStale(result.stale)
            setFailed(false)
          })
          .catch(() => setFailed(true)),
        getNews(force)
          .then((result) => setNews(result.data))
          .catch(() => undefined),
      ]
      if (teamId) {
        jobs.push(
          getDigest(teamId, force)
            .then(setDigest)
            .catch(() => undefined),
        )
      }
      await Promise.all(jobs)
    },
    [teamId],
  )

  useEffect(() => {
    if (!ready) return
    load(false).catch(() => undefined)
  }, [load, ready])

  const decision = useMemo(() => {
    if (!slate) return null
    return resolveFocus(
      profile.focus,
      slate.map((game) => ({ id: game.id, state: game.state, teamIds: [game.away.id, game.home.id] })),
      teamId,
    )
  }, [profile.focus, slate, teamId])

  useEffect(() => {
    if (!ready || !decision) return
    if (JSON.stringify(decision.memory) !== JSON.stringify(profile.focus)) {
      setFocus(decision.memory)
    }
  }, [decision, profile.focus, ready, setFocus])

  const nextGame = useMemo(() => {
    return (slate ?? [])
      .filter((game) => game.state === 'pre')
      .sort((a, b) => a.date.localeCompare(b.date))[0]
  }, [slate])
  const heroId = decision?.mode === 'live' ? decision.focusedGameId : nextGame?.id
  const watchKey = (slate ?? []).map((game) => `${game.id}:${game.state}`).join('|')
  const watching = shouldWatch(slate ?? [])

  const liveNow = watchKey.split('|').some((part) => part.endsWith(':in'))

  useEffect(() => {
    if (!watching) return
    const timer = setInterval(() => {
      if (!liveNow) {
        load(true).catch(() => undefined)
        return
      }
      getSlate(true)
        .then((result) => {
          setSlate(result.data)
          setUpdatedAt(result.at)
          setStale(result.stale)
          setFailed(false)
        })
        .catch(() => undefined)
    }, liveNow ? features.liveRefreshMs : features.soonRefreshMs)
    return () => clearInterval(timer)
  }, [liveNow, load, watching])

  useEffect(() => {
    if (!heroId) {
      setDetail(null)
      return
    }
    let cancel = false
    getGameDetail(heroId, liveNow)
      .then((next) => {
        if (!cancel) setDetail(next)
      })
      .catch(() => {
        if (!cancel) setDetail(null)
      })
    return () => {
      cancel = true
    }
  }, [heroId, liveNow, updatedAt])

  const focused = slate?.find((game) => game.id === heroId)
  const board = detail ?? (focused && focused.state === 'in' ? stubDetail(focused, updatedAt) : null)
  const others = (slate ?? []).filter((game) => game.state === 'in' && game.id !== heroId)
  const finals = (slate ?? []).filter((game) => game.state === 'post')
  const yoursLive = focused && teamId ? focused.away.id === teamId || focused.home.id === teamId : false
  const matchupInjuries = detail && nextGame && detail.game.id === nextGame.id ? detail.injuries : []
  const ticker = [...flashes, ...news.filter((item) => item.big).map((item) => item.headline)].slice(0, newsRules.maxTicker)
  const quiet = news.filter((item) => !item.big).slice(0, newsRules.maxList)
  const banner = !slate?.length && failed ? copy.failed : stale ? copy.stale : null

  return (
    <View style={{ flex: 1 }}>
      <Screen
        gear
        banner={banner}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true)
          load(true)
            .catch(() => undefined)
            .finally(() => setRefreshing(false))
        }}
        footer={updatedAt ? <Muted>{updatedLabel(updatedAt)}</Muted> : null}>
        <NewsTicker items={ticker} />
        {!slate && !failed ? <Muted>{copy.checking}</Muted> : null}
        {decision?.mode === 'live' && board ? <LiveBoard detail={board} /> : null}
        {decision?.mode === 'live' ? (
          <GameStrip title={copy.alsoOn} hint={others.length ? copy.tapToSwap : undefined} games={others} onPress={pin} />
        ) : null}
        {decision?.mode !== 'live' && nextGame ? <MatchupCard game={nextGame} injuries={matchupInjuries} /> : null}
        {finals.length ? (
          <GameStrip title={copy.thisWeek} games={finals} onPress={(id) => router.push(`/game/${id}`)} />
        ) : null}
        {decision?.mode === 'live' && digest && !yoursLive ? <YourClubCard digest={digest} /> : null}
        {decision?.mode === 'digest' ? (
          digest ? (
            <TeamDigest digest={digest} skipGameId={nextGame?.id} />
          ) : teamId ? (
            <Muted>{copy.checking}</Muted>
          ) : (
            <Muted>{copy.pickTeam}</Muted>
          )
        ) : null}
        {quiet.length ? (
          <View style={{ gap: 8 }}>
            <Text style={[section, { color: skin.accent }]}>{copy.aroundLeague}</Text>
            {quiet.map((article) => (
              <View key={article.id} style={story}>
                <Text style={headline}>{article.headline}</Text>
                {article.description ? (
                  <Text style={dek} numberOfLines={3}>
                    {article.description}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}
      </Screen>
    </View>
  )
}

function shouldWatch(games: SlateGame[]): boolean {
  const now = Date.now()
  return games.some((game) => {
    if (game.state === 'in') return true
    if (game.state !== 'pre' || !game.date) return false
    const start = Date.parse(game.date)
    if (!Number.isFinite(start)) return false
    return start - now < features.soonWindowMs && now - start < 5 * 60 * 60 * 1000
  })
}

function stubDetail(game: SlateGame, updatedAt?: number): GameDetail {
  return {
    game,
    pace: game.state === 'pre',
    rows: [],
    more: [],
    leaders: [],
    injuries: [],
    updatedAt: updatedAt ?? Date.now(),
    stale: true,
  }
}

function useScoreFlashes(games: SlateGame[]): string[] {
  const previous = useRef<Map<string, string> | null>(null)
  const [flashes, setFlashes] = useState<string[]>([])
  useEffect(() => {
    const next = new Map<string, string>()
    const born: string[] = []
    for (const game of games) {
      if (game.state !== 'in') continue
      const key = `${game.away.score}-${game.home.score}`
      next.set(game.id, key)
      const old = previous.current?.get(game.id)
      if (previous.current && old && old !== key) {
        born.push(`${game.away.abbr} ${game.away.score}, ${game.home.abbr} ${game.home.score} — ${game.detail}`)
      }
    }
    previous.current = next
    if (born.length) setFlashes((current) => [...born, ...current].slice(0, 6))
  }, [games])
  return flashes
}

const section = {
  color: theme.chalk,
  fontFamily: font.display,
  fontSize: 16,
  letterSpacing: 1,
  textTransform: 'uppercase' as const,
}
const story = { gap: 4, paddingVertical: 4 }
const headline = { color: theme.chalk, fontFamily: font.bodyMed, fontSize: 15 }
const dek = { color: theme.muted, fontFamily: font.body, fontSize: 13, lineHeight: 18 }
