/** Format a decimal-minutes value as h:mm:ss */
export function minutesToHMS(totalMinutes: number): string {
  if (!isFinite(totalMinutes) || totalMinutes < 0) return '0:00:00'
  const totalSecs = Math.round(totalMinutes * 60)
  const h = Math.floor(totalSecs / 3600)
  const m = Math.floor((totalSecs % 3600) / 60)
  const s = totalSecs % 60
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/** Format a decimal-minutes value as h:mm */
export function minutesToHM(totalMinutes: number): string {
  if (!isFinite(totalMinutes) || totalMinutes < 0) return '0:00'
  const h = Math.floor(totalMinutes / 60)
  const m = Math.round(totalMinutes % 60)
  return `${h}:${String(m).padStart(2, '0')}`
}

/** Parse h:mm or h:mm:ss string into decimal minutes. Returns NaN on bad input. */
export function parseTimeToMinutes(value: string): number {
  const trimmed = value.trim()
  const parts = trimmed.split(':')
  if (parts.length === 2) {
    const h = parseFloat(parts[0])
    const m = parseFloat(parts[1])
    if (isNaN(h) || isNaN(m)) return NaN
    return h * 60 + m
  }
  if (parts.length === 3) {
    const h = parseFloat(parts[0])
    const m = parseFloat(parts[1])
    const s = parseFloat(parts[2])
    if (isNaN(h) || isNaN(m) || isNaN(s)) return NaN
    return h * 60 + m + s / 60
  }
  // Plain number (minutes)
  const n = parseFloat(trimmed)
  return isNaN(n) ? NaN : n
}

/** Format RSD amount */
export function fmtRSD(value: number, decimals = 0): string {
  if (!isFinite(value)) return 'N/A'
  return (
    new Intl.NumberFormat('sr-RS', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value) + ' RSD'
  )
}

/** Format a plain number with thousand separators */
export function fmtNum(value: number, decimals = 0): string {
  if (!isFinite(value)) return 'N/A'
  return new Intl.NumberFormat('sr-RS', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/** Format a fraction as percentage string */
export function fmtPct(value: number, decimals = 1): string {
  if (!isFinite(value)) return 'N/A'
  return `${(value * 100).toFixed(decimals)}%`
}

/** Format diff_pct value with sign and color class */
export function diffClass(pct: number, invertGood = false): string {
  const good = invertGood ? pct > 5 : pct < -5
  const bad = invertGood ? pct < -5 : pct > 5
  if (good) return 'text-green-600 font-medium'
  if (bad) return 'text-red-600 font-medium'
  return 'text-gray-700'
}

/** Convert percentage fraction (0.05) input to display form (5) and back */
export function pctToDisplay(frac: number): number {
  return frac * 100
}
export function displayToPct(display: number): number {
  return display / 100
}

/** Months → human-readable string */
export function fmtMonths(months: number): string {
  if (!isFinite(months) || months <= 0) return 'N/A'
  const y = Math.floor(months / 12)
  const m = Math.round(months % 12)
  if (y === 0) return `${m} mo`
  if (m === 0) return `${y} yr`
  return `${y} yr ${m} mo`
}
