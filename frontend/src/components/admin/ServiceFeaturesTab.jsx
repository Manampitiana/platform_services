import { useState } from 'react'
import { useSaveServiceFeatures } from '../../hooks/useAdmin'
import { getApiError } from '../../utils/getApiError'
import Button from '../common/Button'
import Card from '../common/Card'
import FeatureListEditor from './FeatureListEditor'

export default function ServiceFeaturesTab({ service }) {
  const save = useSaveServiceFeatures(service.id)
  const [features, setFeatures] = useState(
    () => (service.features ?? []).map((f) => ({ label: f.label, is_included: true }))
  )
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const submit = async () => {
    setMessage('')
    setError('')
    try {
      await save.mutateAsync(features.filter((f) => f.label.trim()))
      setMessage('Features saved.')
    } catch (err) {
      setError(getApiError(err))
    }
  }

  return (
    <Card className="space-y-4">
      <div>
        <h3 className="font-semibold">What's included</h3>
        <p className="text-sm text-slate-500">General features shown on the service page.</p>
      </div>

      {message && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</p>}
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <FeatureListEditor
        value={features}
        onChange={(v) => {
          setMessage('')
          setFeatures(v)
        }}
        showIncluded={false}
      />

      <div className="flex justify-end">
        <Button onClick={submit} loading={save.isPending}>
          Save features
        </Button>
      </div>
    </Card>
  )
}