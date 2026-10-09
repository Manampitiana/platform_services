import { useState } from 'react'
import { Plus, Send, Trash2 } from 'lucide-react'
import { useDeleteQuote, useSaveQuote, useSendQuote } from '../../hooks/useQuotes'
import { flattenErrors } from '../../utils/flattenErrors'
import { getApiError } from '../../utils/getApiError'
import { calcQuote } from '../../utils/quoteTotals'
import Button from '../common/Button'
import Card from '../common/Card'
import Input from '../common/Input'
import Textarea from '../common/Textarea'
import QuoteStatusBadge from '../common/QuoteStatusBadge'
import QuoteTotals from './QuoteTotals'
import { useConfirm } from '../../contexts/ConfirmContext'
import { useToast } from '../../contexts/ToastContext'

const blankItem = () => ({ title: '', description: '', quantity: 1, unit_price: '', discount: '' })

const fromApi = (i) => ({
  title: i.title,
  description: i.description ?? '',
  quantity: i.quantity,
  unit_price: i.unit_price,
  discount: i.discount || '',
})

export default function QuoteEditor({ quote }) {
  const save = useSaveQuote(quote.id)
  const send = useSendQuote()
  const remove = useDeleteQuote()

  const [items, setItems] = useState(() => (quote.items?.length ? quote.items.map(fromApi) : [blankItem()]))
  const [taxRate, setTaxRate] = useState(quote.tax_rate)
  const [validUntil, setValidUntil] = useState(quote.valid_until ?? '')
  const [notes, setNotes] = useState(quote.notes ?? '')
  const [terms, setTerms] = useState(quote.terms ?? '')
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [formError, setFormError] = useState('')

  const confirm = useConfirm()
  const toast = useToast()

  const totals = calcQuote(items, taxRate)

  const updateItem = (i, patch) => {
    setMessage('')
    setItems((list) => list.map((item, idx) => (idx === i ? { ...item, ...patch } : item)))
  }

  const payload = () => ({
    valid_until: validUntil || null,
    tax_rate: Number(taxRate) || 0,
    notes: notes || null,
    terms: terms || null,
    items: items
      .filter((i) => i.title.trim())
      .map((i) => ({
        title: i.title,
        description: i.description || null,
        quantity: Number(i.quantity) || 1,
        unit_price: Number(i.unit_price) || 0,
        discount: Number(i.discount) || 0,
      })),
  })

  const run = async (action) => {
    setErrors({})
    setFormError('')
    setMessage('')

    try {
      await action()
    } catch (err) {
      const fieldErrors = flattenErrors(err)
      setErrors(fieldErrors)
      setFormError(Object.values(fieldErrors)[0] ?? getApiError(err))
    }
  }

  const saveDraft = () =>
    run(async () => {
      await save.mutateAsync(payload())
      toast.success('Draft saved.')
    })

  const sendToClient = () =>
    run(async () => {
      await save.mutateAsync(payload()) // manamarina sy mitahiry; ny erreur champ miseho ao amin'ny form

      const ok = await confirm({
        title: 'Send this quote to the client?',
        description:
          'The client will be notified by email. You will not be able to edit this version afterwards, but you can create a new version later.',
        confirmLabel: 'Send quote',
        onConfirm: () => send.mutateAsync(quote.id),
      })

      if (ok) toast.success('Quote sent to the client.')
    })

  const deleteDraft = async () => {
    const ok = await confirm({
      title: 'Delete this draft?',
      description: 'This draft and its items will be permanently deleted.',
      confirmLabel: 'Delete draft',
      tone: 'danger',
      onConfirm: () => remove.mutateAsync(quote.id),
    })

    if (ok) toast.success('Draft deleted.')
  }

  return (
    <Card className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-semibold">
          {quote.quote_number} <span className="text-slate-400">· v{quote.version}</span>
        </p>
        <QuoteStatusBadge status="draft" />
      </div>

      {formError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{formError}</p>}
      {/* {message && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</p>} */}

      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="space-y-3 rounded-xl border border-slate-200 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Title *"
                value={item.title}
                onChange={(e) => updateItem(i, { title: e.target.value })}
                error={errors[`items.${i}.title`]}
              />
              <Input
                label="Description"
                value={item.description}
                onChange={(e) => updateItem(i, { description: e.target.value })}
                error={errors[`items.${i}.description`]}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              <Input
                label="Quantity"
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => updateItem(i, { quantity: e.target.value })}
                error={errors[`items.${i}.quantity`]}
              />
              <Input
                label="Unit price"
                type="number"
                min="0"
                value={item.unit_price}
                onChange={(e) => updateItem(i, { unit_price: e.target.value })}
                error={errors[`items.${i}.unit_price`]}
              />
              <Input
                label="Discount"
                type="number"
                min="0"
                value={item.discount}
                onChange={(e) => updateItem(i, { discount: e.target.value })}
                error={errors[`items.${i}.discount`]}
              />
              <div className="flex items-end justify-end">
                <button
                  type="button"
                  onClick={() => setItems((list) => list.filter((_, idx) => idx !== i))}
                  disabled={items.length === 1}
                  className="rounded p-2 text-slate-400 hover:bg-slate-100 hover:text-red-600 disabled:opacity-30"
                  aria-label="Remove item"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        <Button type="button" variant="secondary" size="sm" leftIcon={Plus} onClick={() => setItems((l) => [...l, blankItem()])}>
          Add item
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Tax rate (%)"
          type="number"
          min="0"
          max="100"
          value={taxRate}
          onChange={(e) => setTaxRate(e.target.value)}
          error={errors.tax_rate}
        />
        <Input
          label="Valid until"
          type="date"
          value={validUntil}
          onChange={(e) => setValidUntil(e.target.value)}
          error={errors.valid_until}
        />
      </div>

      <Textarea label="Notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} error={errors.notes} />
      <Textarea label="Terms" rows={3} value={terms} onChange={(e) => setTerms(e.target.value)} error={errors.terms} />

      <QuoteTotals totals={totals} taxRate={taxRate} currency={quote.currency} />
      <p className="text-right text-xs text-slate-400">Totals are recalculated by the server when you save.</p>

      <div className="flex flex-wrap justify-between gap-3">
        <Button variant="ghost" leftIcon={Trash2} onClick={deleteDraft} loading={remove.isPending}>
          Delete draft
        </Button>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={saveDraft} loading={save.isPending && !send.isPending}>
            Save draft
          </Button>
          <Button leftIcon={Send} onClick={sendToClient} loading={send.isPending}>
            Send to client
          </Button>
        </div>
      </div>
    </Card>
  )
}