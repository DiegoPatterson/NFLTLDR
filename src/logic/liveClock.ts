/** "8:42" or "12:03" into seconds left in the quarter. */
export function parseClock(text: string): number | null {
  const match = text.trim().match(/^(\d+):(\d{2})$/)
  if (!match) return null
  const seconds = Number(match[2])
  if (seconds > 59) return null
  return Number(match[1]) * 60 + seconds
}

export function formatClock(total: number): string {
  const safe = Math.max(0, Math.floor(total))
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

/** "2nd 8:42" -> "2nd". "OT 1:02" -> "OT". A line with no clock stays blank. */
export function periodLabel(detail: string): string {
  const match = detail.match(/^(\S+)\s+\d+:\d{2}\s*$/)
  return match ? match[1] : ''
}

export function clockFromDetail(detail: string, displayClock: string): string {
  if (parseClock(displayClock) != null) return displayClock.trim()
  const match = detail.match(/(\d+:\d{2})\s*$/)
  return match && parseClock(match[1]) != null ? match[1] : ''
}

export function liveClockText(detail: string, secondsLeft: number | null): string {
  if (secondsLeft == null) return detail
  const period = periodLabel(detail)
  const clock = formatClock(secondsLeft)
  return period ? `${period} ${clock}` : clock
}
