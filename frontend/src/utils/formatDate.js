export function formatDate(value, options = { day: '2-digit', month: 'short', year: 'numeric' }) {
  return value ? new Date(value).toLocaleDateString('en-GB', options) : '—'
}