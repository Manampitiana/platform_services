export function formatPrice(amount, currency = 'MGA') {
  if (amount === null || amount === undefined) return '—'
  return `${new Intl.NumberFormat('en-US').format(amount)} ${currency}`
}