function asNumber(value?: string): number | null {
  if (!value) return null
  const n = Number(value.replace(/[^\d.-]/g, ''))
  return Number.isFinite(n) ? n : null
}

export function scoreTldr(input: {
  state: 'pre' | 'in' | 'post'
  awayName: string
  homeName: string
  awayScore: string
  homeScore: string
  awayYards?: string
  homeYards?: string
  awayTurnovers?: string
  homeTurnovers?: string
}): string {
  const { awayName, homeName } = input
  if (input.state === 'pre') {
    return `${awayName} at ${homeName}. The table is season pace, not a box score.`
  }
  const away = asNumber(input.awayScore)
  const home = asNumber(input.homeScore)
  if (away == null || home == null) return `${awayName} at ${homeName}.`
  if (away === home) {
    return input.state === 'post' ? `Final, tied ${away}-${home}.` : `Tied ${away}-${home}.`
  }
  const homeLeads = home > away
  const leader = homeLeads ? homeName : awayName
  const trailer = homeLeads ? awayName : homeName
  const hi = Math.max(away, home)
  const lo = Math.min(away, home)
  const verb = input.state === 'post' ? 'won' : 'lead'
  const leadYards = asNumber(homeLeads ? input.homeYards : input.awayYards)
  const trailYards = asNumber(homeLeads ? input.awayYards : input.homeYards)
  const leadTo = asNumber(homeLeads ? input.homeTurnovers : input.awayTurnovers)
  const trailTo = asNumber(homeLeads ? input.awayTurnovers : input.homeTurnovers)
  if (leadYards != null && trailYards != null && leadYards < trailYards) {
    if (leadTo != null && trailTo != null && leadTo < trailTo) {
      return `${leader} ${verb} ${hi}-${lo} without winning the yardage, and with fewer turnovers.`
    }
    return `${leader} ${verb} ${hi}-${lo} even though ${trailer} have more yards.`
  }
  return `${leader} ${verb} ${hi}-${lo}.`
}

export function teamTldr(name: string, record: string, standing: string): string {
  if (record && standing) return `${name} are ${record}, ${standing}.`
  if (record) return `${name} are ${record}.`
  if (standing) return `${name}, ${standing}.`
  return `${name}.`
}
