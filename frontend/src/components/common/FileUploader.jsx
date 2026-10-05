import { useRef, useState } from 'react'
import { FileText, Loader2, Trash2, Upload } from 'lucide-react'
import { getApiError } from '../../utils/getApiError'

const MAX_SIZE = 10 * 1024 * 1024

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export default function FileUploader({
  label,
  help = 'PDF, DOC, DOCX, JPG, PNG or ZIP. Max 10 MB per file.',
  files = [],
  multiple = true,
  onUpload,
  onRemove,
}) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const handleChange = async (event) => {
    const selected = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (!selected.length) return

    setBusy(true)
    setError('')

    for (const file of selected) {
      if (file.size > MAX_SIZE) {
        setError(`"${file.name}" is larger than 10 MB.`)
        break
      }
      try {
        await onUpload(file)
      } catch (err) {
        setError(getApiError(err))
        break
      }
    }

    setBusy(false)
  }

  const handleRemove = async (file) => {
    setError('')
    try {
      await onRemove(file)
    } catch (err) {
      setError(getApiError(err))
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-700">{label}</p>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="flex w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 bg-white px-4 py-6 text-sm text-slate-500 transition hover:border-brand-500 hover:text-brand-600 disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
        <span className="font-medium">{busy ? 'Uploading...' : 'Click to upload'}</span>
        <span className="text-xs text-slate-400">{help}</span>
      </button>

      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        className="hidden"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip"
        onChange={handleChange}
      />

      {error && <p className="text-xs text-red-600">{error}</p>}

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file) => (
            <li
              key={file.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            >
              <span className="flex min-w-0 items-center gap-2">
                <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                <span className="truncate">{file.original_name}</span>
                <span className="shrink-0 text-xs text-slate-400">{formatSize(file.size)}</span>
              </span>
              <button
                type="button"
                onClick={() => handleRemove(file)}
                className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-red-600"
                aria-label={`Remove ${file.original_name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}