import Card from '../common/Card'

const humanize = (key) => key.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())

export default function BriefTab({ brief }) {
  const entries = Object.entries(brief ?? {}).filter(([, v]) => v !== null && v !== '')

  return (
    <Card>
      {entries.length === 0 ? (
        <p className="text-sm text-slate-500">No brief details.</p>
      ) : (
        <dl className="divide-y divide-slate-100">
          {entries.map(([key, value]) => (
            <div key={key} className="grid gap-1 py-3 sm:grid-cols-3">
              <dt className="text-sm text-slate-500">{humanize(key)}</dt>
              <dd className="whitespace-pre-line text-sm sm:col-span-2">
                {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </Card>
  )
}