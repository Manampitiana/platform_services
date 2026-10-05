import { useState } from 'react'
import { Upload } from 'lucide-react'
import Button from '../common/Button'
import Input from '../common/Input'
import Skeleton from '../common/Skeleton'
import { useCreatePayment, usePaymentMethods } from '../../hooks/usePayments'
import { applyApiErrors } from '../../utils/applyApiErrors'
import { getApiError } from '../../utils/getApiError'
import { formatPrice } from '../../utils/formatPrice'

export default function PaymentForm({ order }) {
  const { data: methods, isLoading } = usePaymentMethods()
  const create = useCreatePayment(order.uuid)

  const [method, setMethod] = useState('')
  const [reference, setReference] = useState('')
  const [proof, setProof] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')

  if (isLoading) return <Skeleton className="h-48 w-full" />

  const selected = methods?.find((m) => m.code === method)

  const submit = async (e) => {
    e.preventDefault()
    setFormError('')
    setFieldErrors({})

    try {
      await create.mutateAsync({ method, transaction_reference: reference, proof })
    } catch (error) {
      const errors = error?.response?.data?.errors
      if (errors) {
        setFieldErrors(Object.fromEntries(Object.entries(errors).map(([k, v]) => [k, v[0]])))
      } else {
        setFormError(getApiError(error))
      }
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <h3 className="font-semibold">Pay {formatPrice(order.due_amount, order.currency)}</h3>
        <p className="mt-1 text-sm text-slate-500">Choose a payment method and follow the instructions.</p>
      </div>

      {formError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{formError}</p>}

      <div className="grid gap-2 sm:grid-cols-2">
        {methods?.map((m) => (
          <button
            type="button"
            key={m.code}
            onClick={() => setMethod(m.code)}
            className={`rounded-xl border p-3 text-left text-sm font-medium transition ${
              method === m.code
                ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            {m.name}
          </button>
        ))}
      </div>
      {fieldErrors.method && <p className="text-xs text-red-600">{fieldErrors.method}</p>}

      {selected && (
        <div className="space-y-1 rounded-xl bg-slate-50 p-4 text-sm">
          <p className="font-medium">{selected.account_name}</p>
          <p className="text-lg font-bold tracking-wide">{selected.account_number}</p>
          {selected.instructions && <p className="text-slate-500">{selected.instructions}</p>}
        </div>
      )}

      {selected && (
        <>
          <Input
            label="Transaction reference"
            placeholder="e.g. MP240101.1234.A56789"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            error={fieldErrors.transaction_reference}
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Proof of payment (optional)</label>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-3 text-sm text-slate-500 hover:border-brand-500">
              <Upload className="h-4 w-4" />
              <span className="truncate">{proof ? proof.name : 'Upload screenshot or PDF (max 5 MB)'}</span>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
                onChange={(e) => setProof(e.target.files?.[0] ?? null)}
              />
            </label>
            {fieldErrors.proof && <p className="text-xs text-red-600">{fieldErrors.proof}</p>}
          </div>

          <Button type="submit" loading={create.isPending} className="w-full">
            I have paid
          </Button>
        </>
      )}
    </form>
  )
}