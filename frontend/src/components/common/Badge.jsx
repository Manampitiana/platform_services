const tones = {
  gray: 'bg-slate-100 text-slate-700 truncate',
  blue: 'bg-blue-100 text-blue-700 truncate',
  green: 'bg-green-100 text-green-700 truncate',
  yellow: 'bg-yellow-100 text-yellow-800 truncate',
  red: 'bg-red-100 text-red-700 truncate',
  purple: 'bg-purple-100 text-purple-700 truncate',
}

export default function Badge({ children, tone = 'gray' }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  )
}