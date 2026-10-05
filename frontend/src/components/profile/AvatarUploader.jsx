import { useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Camera, Loader2 } from 'lucide-react'
import { profileApi } from '../../api/profileApi'
import { useAuth } from '../../contexts/AuthContext'
import { flattenErrors } from '../../utils/flattenErrors'
import { getApiError } from '../../utils/getApiError'
import Avatar from '../common/Avatar'

const MAX_SIZE = 2 * 1024 * 1024
const TYPES = ['image/jpeg', 'image/png', 'image/webp']

export default function AvatarUploader() {
  const { user, setUser } = useAuth()
  const queryClient = useQueryClient()
  const inputRef = useRef(null)

  const [busy, setBusy] = useState(false)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')

  const refreshCaches = () =>
    ['messages', 'orders', 'admin'].forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }))

  const pick = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setError('')

    if (!TYPES.includes(file.type)) {
      setError('Please choose a JPG, PNG or WebP image.')
      return
    }
    if (file.size > MAX_SIZE) {
      setError('The image must be smaller than 2 MB.')
      return
    }

    const url = URL.createObjectURL(file)
    setPreview(url)
    setBusy(true)

    try {
      setUser(await profileApi.uploadAvatar(file))
      refreshCaches()
    } catch (err) {
      setError(flattenErrors(err).avatar ?? getApiError(err))
    } finally {
      setBusy(false)
      setPreview(null)
      URL.revokeObjectURL(url)
    }
  }

  const remove = async () => {
    if (!window.confirm('Remove your profile photo?')) return

    setError('')
    setBusy(true)
    try {
      setUser(await profileApi.removeAvatar())
      refreshCaches()
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-2 lg:items-start">
      <div className="relative w-fit">
        <div className="relative rounded-full bg-white p-1 shadow-card">
          <Avatar name={user.name} src={preview ?? user.avatar_url} size="xl" />
          {busy && (
            <span className="absolute inset-1 flex items-center justify-center rounded-full bg-white/70">
              <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
            </span>
          )}
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          aria-label={user.avatar_url ? 'Change photo' : 'Upload photo'}
          className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white shadow ring-2 ring-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          <Camera className="h-4 w-4" />
        </button>
      </div>

      {user.avatar_url && (
        <button
          type="button"
          disabled={busy}
          onClick={remove}
          className="text-xs text-slate-500 transition hover:text-red-600 disabled:opacity-60"
        >
          Remove photo
        </button>
      )}

      {error && <p className="max-w-56 text-center text-xs text-red-600 lg:text-left">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={pick}
      />
    </div>
  )
}