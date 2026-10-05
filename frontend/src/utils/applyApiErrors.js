// Mametraka ny erreur avy amin'ny Laravel (422) ao amin'ny react-hook-form
export function applyApiErrors(error, setError) {
  const errors = error?.response?.data?.errors
  if (errors) {
    Object.entries(errors).forEach(([field, messages]) => {
      setError(field, { type: 'server', message: messages[0] })
    })
    return true
  }
  return false
}