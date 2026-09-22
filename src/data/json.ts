export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function arr(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

export function str(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return fallback
}

export function parseStatNumber(value: string | undefined): number | null {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed || /[/–-]/.test(trimmed)) return null
  const n = Number(trimmed.replace(/,/g, ''))
  return Number.isFinite(n) ? n : null
}
