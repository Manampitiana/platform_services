import { useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { SearchX } from 'lucide-react'
import { ordersApi } from '../../api/ordersApi'
import { useService } from '../../hooks/useServices'
import { getApiError } from '../../utils/getApiError'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import PageHeader from '../../components/common/PageHeader'
import Skeleton from '../../components/common/Skeleton'
import OrderStepper from '../../components/orders/OrderStepper'
import OrderSuccess from '../../components/orders/OrderSuccess'
import Step2Package from '../../components/orders/Step2Package'
import Step3Brief from '../../components/orders/Step3Brief'
import Step4Files from '../../components/orders/Step4Files'
import Step5Summary from '../../components/orders/Step5Summary'

export default function NewOrder() {
  const [params] = useSearchParams()
  const serviceSlug = params.get('service')

  const { data: service, isLoading, isError, error, refetch } = useService(serviceSlug)

  const [stepKey, setStepKey] = useState(null)
  const [packageSlug, setPackageSlug] = useState(params.get('package'))
  const [order, setOrder] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitted, setSubmitted] = useState(null)

  if (!serviceSlug) return <Navigate to="/services" replace />

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-12">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (isError) {
    const notFound = error?.response?.status === 404
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        {notFound ? (
          <EmptyState
            icon={SearchX}
            title="Service not found"
            description="This service does not exist or is no longer available."
            action={
              <Link to="/services">
                <Button>Browse services</Button>
              </Link>
            }
          />
        ) : (
          <ErrorState onRetry={refetch} />
        )}
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <OrderSuccess order={submitted} />
      </div>
    )
  }

  const packages = service.packages ?? []
  const hasPackages = packages.length > 0
  const fields = service.form_fields ?? []

  // Ignore an invalid ?package= value
  const validPackage = packages.some((p) => p.slug === packageSlug) ? packageSlug : null

  const steps = [
    ...(hasPackages ? [{ key: 'package', label: 'Package' }] : []),
    { key: 'brief', label: 'Details' },
    { key: 'files', label: 'Files' },
    { key: 'summary', label: 'Summary' },
  ]

  const current = stepKey ?? (hasPackages && !validPackage ? 'package' : 'brief')
  const index = steps.findIndex((s) => s.key === current)
  const goNext = () => setStepKey(steps[index + 1].key)
  const goBack = () => setStepKey(steps[index - 1].key)

  const selectedPackage = packages.find((p) => p.slug === validPackage) ?? null

  // Creates the draft on the first save, then saves the brief
  const handleBrief = async (brief) => {
    const pkg = hasPackages ? validPackage : null

    let current = order
    if (!current) {
      current = await ordersApi.create({ service: service.slug, package: pkg })
      setOrder(current)
    }

    const updated = await ordersApi.saveBrief(current.uuid, { brief, package: pkg })
    setOrder(updated)
    goNext()
  }

  const handleUpload = async (file, category) => {
    const saved = await ordersApi.uploadFile(order.uuid, file, category)
    setOrder((o) => ({ ...o, files: [...(o.files ?? []), saved] }))
  }

  const handleRemove = async (file) => {
    await ordersApi.deleteFile(order.uuid, file.id)
    setOrder((o) => ({ ...o, files: o.files.filter((f) => f.id !== file.id) }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setSubmitError('')
    try {
      setSubmitted(await ordersApi.submit(order.uuid))
    } catch (err) {
      setSubmitError(getApiError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <PageHeader
        title={`Order: ${service.name}`}
        description={selectedPackage ? `${selectedPackage.name} package` : undefined}
      />

      <OrderStepper steps={steps} current={current} />

      <Card>
        {current === 'package' && (
          <Step2Package
            packages={packages}
            currency={service.currency}
            selected={validPackage}
            onSelect={setPackageSlug}
            onNext={goNext}
          />
        )}

        {current === 'brief' && (
          <Step3Brief
            fields={fields}
            savedBrief={order?.brief_data}
            onBack={hasPackages ? goBack : undefined}
            onSubmit={handleBrief}
          />
        )}

        {current === 'files' && (
          <Step4Files
            fields={fields}
            files={order?.files ?? []}
            onUpload={handleUpload}
            onRemove={handleRemove}
            onBack={goBack}
            onNext={goNext}
          />
        )}

        {current === 'summary' && (
          <Step5Summary
            order={order}
            service={service}
            fields={fields}
            submitting={submitting}
            error={submitError}
            onBack={goBack}
            onSubmit={handleSubmit}
          />
        )}
      </Card>
    </div>
  )
}