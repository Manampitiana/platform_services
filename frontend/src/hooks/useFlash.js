import { useEffect, useState } from 'react'

// Hafatra vonjimaika ({ tone, text }) izay miala ho azy
export function useFlash(duration = 4500) {
  const [flash, setFlash] = useState(null)

  useEffect(() => {
    if (!flash) return
    const timer = setTimeout(() => setFlash(null), duration)
    return () => clearTimeout(timer)
  }, [flash, duration])

  return [flash, setFlash]
}