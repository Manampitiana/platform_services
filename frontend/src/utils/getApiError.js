export function getApiError(error, fallback = 'Something went wrong. Please try again.') {
  const data = error?.response?.data
  if (data?.errors) return Object.values(data.errors).flat()[0]
  if (typeof data?.message === 'string' && data.message) return data.message
  return fallback
}