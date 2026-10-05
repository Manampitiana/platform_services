import { useState } from 'react'
import { Download, FileText } from 'lucide-react'
import { ordersApi } from '../../api/ordersApi'
import { getApiError } from '../../utils/getApiError'
import Button from '../common/Button'
import Card from '../common/Card'

export default function FilesTab({ uuid, files = [] }) {
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  const download = async (file) => {
    setError('')
    setBusyId(file.id)
    try {
      await ordersApi.downloadFile(uuid, file)
    } catch (err) {
      setError(getApiError(err, 'Could not download this file.'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <Card>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      {files.length === 0 ? (
        <p className="text-sm text-slate-500">No files attached.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {files.map((file) => (
            <li key={file.id} className="flex items-center justify-between gap-3 py-3">
              <span className="flex min-w-0 items-center gap-2 text-sm">
                <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                <span className="truncate">{file.original_name}</span>
              </span>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={Download}
                loading={busyId === file.id}
                onClick={() => download(file)}
              >
                Download
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}