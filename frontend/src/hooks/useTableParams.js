import { useSearchParams } from 'react-router-dom'

// State an'ny tableau (filtre, tri, pejy...) voatahiry ao amin'ny URL: azo zaraina, ary mijanona rehefa refresh
export function useTableParams({ defaults = {} } = {}) {
  const [params, setParams] = useSearchParams()

  const get = (key) => params.get(key) ?? defaults[key] ?? ''

  const update = (patch) => {
    const next = new URLSearchParams(params)

    Object.entries(patch).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined || String(value) === String(defaults[key] ?? '')) {
        next.delete(key)
      } else {
        next.set(key, String(value))
      }
    })

    // Miverina ho pejy 1 rehefa miova ny filtre, afa-tsy ny pejy mihitsy no novaina
    if (!('page' in patch)) next.delete('page')

    setParams(next, { replace: true })
  }

  const reset = () => setParams({}, { replace: true })

  return { get, update, reset, params }
}