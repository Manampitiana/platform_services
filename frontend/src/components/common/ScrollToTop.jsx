import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) return // avelao ny anchor (#section) hiasa
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, hash])

  return null
}