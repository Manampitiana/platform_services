import { useEffect, useRef, useState } from 'react'
import { MessageSquare, Paperclip, Send, X } from 'lucide-react'
import { messagesApi } from '../../api/messagesApi'
import { useConfirm } from '../../contexts/ConfirmContext'
import { useToast } from '../../contexts/ToastContext'
import { useDeleteMessage, useMessages, useSendMessage } from '../../hooks/useMessages'
import { getApiError } from '../../utils/getApiError'
import Button from '../common/Button'
import Card from '../common/Card'
import EmptyState from '../common/EmptyState'
import ErrorState from '../common/ErrorState'
import Skeleton from '../common/Skeleton'
import MessageBubble from './MessageBubble'

const CLOSED = ['draft', 'cancelled', 'refunded']

// Hafatra maromaro avy amin'ny olona iray, ao anatin'ny 5 minitra, dia atambatra.
// Ny hafatra voafafa dia tsy atambatra (tombstone misaraka).
const isGrouped = (current, previous) =>
  Boolean(previous) &&
  !previous.is_deleted &&
  !current.is_deleted &&
  previous.is_mine === current.is_mine &&
  previous.sender.name === current.sender.name &&
  new Date(current.created_at) - new Date(previous.created_at) < 5 * 60 * 1000

export default function MessagesTab({ order }) {
  const { data: messages, isLoading, isError, error: loadError, refetch } = useMessages(order.uuid)
  const send = useSendMessage(order.uuid)
  const removeMessage = useDeleteMessage(order.uuid)
  const confirm = useConfirm()
  const toast = useToast()

  const [body, setBody] = useState('')
  const [attachment, setAttachment] = useState(null)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)
  const fileRef = useRef(null)

  const closed = CLOSED.includes(order.status)
  const count = messages?.length ?? 0

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [count])

  const clearAttachment = () => {
    setAttachment(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const submit = async (e) => {
    e?.preventDefault()
    if (send.isPending || (!body.trim() && !attachment)) return
    setError('')

    try {
      await send.mutateAsync({ body: body.trim(), attachment })
      setBody('')
      clearAttachment()
    } catch (err) {
      setError(getApiError(err))
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit()
  }

  const download = async (message) => {
    try {
      await messagesApi.downloadAttachment(order.uuid, message)
    } catch {
      setError('Could not download this attachment.')
    }
  }

  const handleDelete = async (message) => {
    setError('')

    const ok = await confirm({
      title: 'Delete this message?',
      description:
        'It will be replaced by "This message was deleted" for everyone in this conversation.',
      confirmLabel: 'Delete message',
      tone: 'danger',
      onConfirm: () => removeMessage.mutateAsync(message.id),
    })

    if (ok) toast.success('Message deleted.')
  }

  if (isLoading) return <Skeleton className="h-64 w-full" />

  if (isError) {
    return <ErrorState description={loadError?.response?.data?.message} onRetry={refetch} />
  }

  return (
    <Card className="space-y-4">
      <div className="max-h-[50vh] min-h-40 overflow-y-auto pb-1 pr-1 sm:max-h-96">
        {count === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No messages yet"
            description="Start the conversation about this order."
          />
        ) : (
          messages.map((m, i) => (
            <MessageBubble
              key={m.id}
              message={m}
              grouped={isGrouped(m, messages[i - 1])}
              onDownload={download}
              onDelete={handleDelete}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {closed ? (
        <p className="text-center text-sm text-slate-500">Messaging is closed for this order.</p>
      ) : (
        <form onSubmit={submit} className="space-y-2 border-t border-slate-100 pt-4">
          {attachment && (
            <div className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs">
              <span className="flex min-w-0 items-center gap-2">
                <Paperclip className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span className="truncate">{attachment.name}</span>
              </span>
              <button
                type="button"
                onClick={clearAttachment}
                className="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                aria-label="Remove attachment"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={onKeyDown}
            rows={3}
            placeholder="Write a message..."
            className="block w-full resize-none rounded-xl border border-slate-300 px-3.5 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
          />

          <div className="flex items-center justify-between gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700">
              <Paperclip className="h-4 w-4" />
              Attach
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip"
                className="hidden"
                onChange={(e) => setAttachment(e.target.files?.[0] ?? null)}
              />
            </label>

            <div className="flex items-center gap-3">
              <span className="hidden text-xs text-slate-400 md:inline">Ctrl + Enter to send</span>
              <Button type="submit" loading={send.isPending} leftIcon={Send}>
                Send
              </Button>
            </div>
          </div>
        </form>
      )}
    </Card>
  )
}