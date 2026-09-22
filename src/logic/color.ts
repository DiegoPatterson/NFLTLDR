import { teamBrand, teamColorOverrides } from '@/src/config/teamColors'

export function hex(value: string | null | undefined, fallback = '#E2C16B'): string {
  if (!value) return fallback
  const h = value.startsWith('#') ? value : `#${value}`
  return /^#[0-9a-fA-F]{6}$/.test(h) ? h.toUpperCase() : fallback
}

export function luminance(color: string): number {
  const h = hex(color).slice(1)
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

/** Ink that stays readable on a team color chip. */
export function inkOn(color: string): string {
  return luminance(color) > 0.62 ? '#07140F' : '#F4F1E8'
}

/** `toward` 0 keeps `from`. 1 becomes `to`. */
export function mix(from: string, to: string, toward: number): string {
  const read = (color: string) => {
    const h = hex(color).slice(1)
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
  }
  const a = read(from)
  const b = read(to)
  const t = Math.min(1, Math.max(0, toward))
  const mixed = a.map((channel, index) => Math.round(channel + (b[index] - channel) * t))
  return `#${mixed.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`.toUpperCase()
}

export function withAlpha(color: string, alpha: number): string {
  const h = hex(color).slice(1)
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * Very dark club colors (Raiders black, for example) disappear on a turf background.
 * Fall through to the alternate, then to gold.
 */
export function accentFor(primary: string, alternate: string): string {
  if (luminance(primary) >= 0.22) return primary
  if (luminance(alternate) >= 0.22) return alternate
  return '#E2C16B'
}

export function paint(
  abbr: string,
  primary?: string | null,
  alternate?: string | null,
): { color: string; alt: string } {
  const brand = teamBrand[abbr]
  const over = teamColorOverrides[abbr] ?? {}
  return {
    color: hex(over.field || brand?.field || primary),
    alt: hex(over.accent || brand?.accent || alternate, '#04100C'),
  }
}
