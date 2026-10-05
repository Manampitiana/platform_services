import { useEffect, useState } from 'react'

const palette = [
  'bg-indigo-100 text-indigo-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-sky-100 text-sky-700',
  'bg-rose-100 text-rose-700',
  'bg-violet-100 text-violet-700',
]

const sizes = {
  sm: 'h-7 w-7 text-[11px]',
  md: 'h-9 w-9 text-xs',
  lg: 'h-11 w-11 text-sm',
  xl: 'h-24 w-24 text-3xl',
}

export default function Avatar({ name = '?', src, size = 'md', className = '' }) {
  const [failed, setFailed] = useState(false)

  // Averina andramana rehefa miova ny URL (sary vaovao)
  useEffect(() => {
    setFailed(false)
  }, [src])

  if (src && !failed) {
    return (
      <img
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className={`shrink-0 rounded-full object-cover ring-1 ring-slate-200 ${sizes[size]} ${className}`}
      />
    )
  }

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()

  const color = palette[[...name].reduce((sum, c) => sum + c.charCodeAt(0), 0) % palette.length]

  return (
    <span
      className={`inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold ${sizes[size]} ${color} ${className}`}
      aria-hidden="true"
    >
      {initials || '?'}
    </span>
  )
}