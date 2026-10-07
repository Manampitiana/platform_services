import { useState } from 'react'
import { ChevronDown, Inbox, Mail, RotateCcw, Trash2, Check } from 'lucide-react'
import {
  useAdminContactMessages,
  useDeleteContact,
  useHandleContact,
} from '../../hooks/useAdmin'
import { getApiError } from '../../utils/getApiError'
import { timeAgo } from '../../utils/timeAgo'
import Avatar from '../../components/common/Avatar'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import PageHeader from '../../components/common/PageHeader'
import Pagination from '../../components/common/Pagination'
import Skeleton from '../../components/common/Skeleton'

const FILTERS = [
  { value: 'open', label: 'To handle' },
  { value: 'handled', label: 'Handled' },
  { value: 'spam', label: 'Spam' },
]

export default function AdminContactMessages() {
  const [status, setStatus] = useState('open')
  const [page, setPage] = useState(1)
  const [openId, setOpenId] = useState(null)
  const [error, setError] = useState('')

  const { data, isLoading, isError, refetch } = useAdminContactMessages({ status, page })
  const handle = useHandleContact()
  const remove = useDeleteContact()

  const run = async (action) => {
    setError('')
    try {
      await action()
    } catch (err) {
      setError(getApiError(err))
    }
  }

  const changeStatus = (value) => {
    setStatus(value)
    setPage(1)
    setOpenId(null)
  }

  const chip = (active) =>
    `shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition ${
      active ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
    }`

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title="Contact inbox" description="Messages sent from the contact form." />

      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {FILTERS.map((f) => (
          <button key={f.value} className={chip(status === f.value)} onClick={() => changeStatus(f.value)}>
            {f.label}
          </button>
        ))}
      </div>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : data?.data?.length ? (
        <>
          <Card padded={false}>
            <ul className="divide-y divide-slate-100">
              {data.data.map((m) => {
                const open = openId === m.id

                return (
                  <li key={m.id}>
                    <button
                      onClick={() => setOpenId(open ? null : m.id)}
                      aria-expanded={open}
                      className="flex w-full items-start gap-3 px-4 py-4 text-left transition hover:bg-slate-50 sm:px-6"
                    >
                      <Avatar name={m.name} />
                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-2">
                          <span className={`truncate ${m.handled_at ? 'font-medium' : 'font-semibold'}`}>{m.name}</span>
                          <Badge tone="purple">{m.subject}</Badge>
                        </p>
                        {!open && <p className="mt-0.5 truncate text-sm text-slate-500">{m.message}</p>}
                        <p className="mt-0.5 text-xs text-slate-400">{m.email} · {timeAgo(m.created_at)}</p>
                      </div>
                      <ChevronDown className={`mt-1 h-4 w-4 shrink-0 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
                    </button>

                    {open && (
                      <div className="space-y-4 border-t border-slate-100 bg-slate-50/60 px-4 py-4 sm:px-6">
                        <p className="whitespace-pre-line break-words text-sm leading-relaxed text-slate-700">{m.message}</p>

                        <div className="flex flex-wrap gap-2">
                          <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`}>
                            <Button size="sm" leftIcon={Mail}>Reply by email</Button>
                          </a>

                          {m.handled_at ? (
                            <Button
                              size="sm"
                              variant="secondary"
                              leftIcon={RotateCcw}
                              onClick={() => run(() => handle.mutateAsync({ id: m.id, reopen: true }))}
                            >
                              Reopen
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="secondary"
                              leftIcon={Check}
                              onClick={() => run(() => handle.mutateAsync({ id: m.id }))}
                            >
                              Mark as handled
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="ghost"
                            leftIcon={Trash2}
                            onClick={() => window.confirm('Delete this message?') && run(() => remove.mutateAsync(m.id))}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </Card>
          <Pagination meta={data.meta} onPageChange={setPage} />
        </>
      ) : (
        <EmptyState
          icon={Inbox}
          title={status === 'open' ? 'Inbox zero' : 'Nothing here'}
          description={status === 'open' ? 'No message is waiting for a reply.' : 'No messages for this filter.'}
        />
      )}
    </div>
  )
}