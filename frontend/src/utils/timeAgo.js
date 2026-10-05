const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

export function timeAgo(date) {
  const seconds = Math.round((new Date(date) - Date.now()) / 1000)
  const units = [
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]

  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit)
  }
  return 'just now'
}