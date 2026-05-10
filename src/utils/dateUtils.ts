/**
 * Formats a Date object as an ISO date string (YYYY-MM-DD) using local time.
 * Avoids UTC-shift issues that arise from Date.toISOString().
 */
export function toISODateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Given an ISO date string (YYYY-MM-DD), returns the string for the
 * previous calendar day.  JavaScript Date handles month/year roll-overs
 * automatically when day = 0 (last day of prior month).
 */
export function getYesterdayOf(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  // day - 1 = 0 when day is 1 → JS rolls back to last day of previous month
  const date = new Date(year, month - 1, day - 1)
  return toISODateString(date)
}
