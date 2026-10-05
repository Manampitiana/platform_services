import { useState } from 'react'
import { CheckCircle2, FilePlus2, FileText, XCircle } from 'lucide-react'
import {
  useAcceptQuote,
  useCreateQuote,
  useQuotes,
  useRejectQuote,
} from '../../hooks/useQuotes'
import { getApiError } from '../../utils/getApiError'
import Button from '../common/Button'
// import Card from '../common/Card'
import EmptyState from '../common/EmptyState'
import ErrorState from '../common/ErrorState'
import Modal from '../common/Modal'
import Skeleton from '../common/Skeleton'
import Textarea from '../common/Textarea'
import QuoteCard from './QuoteCard'
import QuoteEditor from './QuoteEditor'

const QUOTABLE = ['submitted', 'under_review', 'quote_pending', 'quote_sent']

export default function QuotesTab({ order, admin = false }) {
  const { data: quotes, isLoading, isError, refetch } = useQuotes(order.uuid)
  const create = useCreateQuote()
  const accept = useAcceptQuote()
  const reject = useRejectQuote()

  const [answer, setAnswer] = useState(null) // { quote, mode: 'accept' | 'reject' }
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  if (isLoading) return <Skeleton className="h-64 w-full" />
  if (isError) return <ErrorState onRetry={refetch} />

  const latest = quotes?.[0]
  const canCreate =
    admin && QUOTABLE.includes(order.status) && latest?.status !== 'draft' && latest?.status !== 'accepted'

  const run = async (action) => {
    setError('')
    try {
      await action()
      return true
    } catch (err) {
      setError(getApiError(err))
      return false
    }
  }

  const submitAnswer = async () => {
    const mutation = answer.mode === 'accept' ? accept : reject
    const ok = await run(() => mutation.mutateAsync({ id: answer.quote.id, note: note.trim() || undefined }))

    if (ok) {
      setAnswer(null)
      setNote('')
    }
  }

  const canRespond = (quote) =>
    !admin && quote.status === 'sent' && !quote.is_expired && order.status === 'quote_sent'

  return (
    <div className="space-y-4">
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {canCreate && (
        <div className="flex justify-end">
          <Button
            leftIcon={FilePlus2}
            loading={create.isPending}
            onClick={() => run(() => create.mutateAsync(order.uuid))}
          >
            {latest ? 'New version' : 'Create quote'}
          </Button>
        </div>
      )}

      {!quotes?.length ? (
        <EmptyState
          icon={FileText}
          title="No quote yet"
          description={
            admin
              ? 'Create a quote once you have reviewed the request.'
              : 'Our team is reviewing your request. You will be notified when your quote is ready.'
          }
        />
      ) : (
        quotes.map((quote) =>
          admin && quote.status === 'draft' ? (
            <QuoteEditor key={quote.id} quote={quote} />
          ) : (
            <QuoteCard key={quote.id} quote={quote}>
              {canRespond(quote) && (
                <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
                  <Button
                    variant="secondary"
                    leftIcon={XCircle}
                    onClick={() => setAnswer({ quote, mode: 'reject' })}
                  >
                    Decline
                  </Button>
                  <Button leftIcon={CheckCircle2} onClick={() => setAnswer({ quote, mode: 'accept' })}>
                    Accept quote
                  </Button>
                </div>
              )}
            </QuoteCard>
          )
        )
      )}

      <Modal
        open={!!answer}
        onClose={() => setAnswer(null)}
        title={answer?.mode === 'accept' ? 'Accept this quote' : 'Decline this quote'}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            {answer?.mode === 'accept'
              ? 'After accepting, you will be asked to pay to start production.'
              : 'Tell us what should change and we will send you a new version.'}
          </p>
          <Textarea
            label="Comment (optional)"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setAnswer(null)}>
              Cancel
            </Button>
            <Button
              variant={answer?.mode === 'accept' ? 'primary' : 'danger'}
              loading={accept.isPending || reject.isPending}
              onClick={submitAnswer}
            >
              {answer?.mode === 'accept' ? 'Confirm and accept' : 'Decline quote'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}