import { motion } from 'motion/react'
import { Check, CheckCheck, Paperclip } from 'lucide-react'
import Avatar from '../common/Avatar'
import { datetimeRegex } from 'zod/v3'
import { _isoDateTime } from 'zod/v4/core'

const time = (date) =>
  new Date(date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

export default function MessageBubble({ message, grouped = false, onDownload }) {
  const mine = message.is_mine
  const seen = Boolean(message.read_at)

  const bubble = mine ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-800'
  const tailColor = mine ? 'bg-brand-600' : 'bg-slate-100'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`flex items-end gap-2.5 ${mine ? 'flex-row-reverse' : ''} ${grouped ? 'mt-1' : 'mt-4'}`}
    >
      {/* Avatar: nafenina rehefa andiana hafatra avy amin'ny olona iray */}
      <div className="w-9 shrink-0 self-start pt-5">
        {!grouped && <Avatar name={message.sender.name} src={message.sender.avatar_url} />}
      </div>

      <div className={`flex min-w-0 max-w-[80%] flex-col sm:max-w-[75%] ${mine ? 'items-end' : 'items-start'}`}>
        {!grouped && (
          <p className="mb-1 flex items-center gap-1.5 px-1 text-xs">
            <span className="font-semibold text-slate-700">{mine ? 'You' : message.sender.name}</span>
            {!mine && message.sender.is_admin && (
              <span className="rounded bg-brand-50 px-1.5 py-px text-[10px] font-semibold uppercase text-brand-700">
                Team
              </span>
            )}
            <span className="text-slate-400 text-[11px]">
              {new Date(message.created_at).toLocaleString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </p>
        )}

        <div
          className={`relative break-words rounded-2xl px-4 py-2.5 text-sm ${bubble} ${!grouped ? (mine ? 'rounded-br-none' : 'rounded-bl-none') : ''
            }`}
        >
          {/* Rambony */}
          {!grouped && (
            <span
              aria-hidden="true"
              className={`absolute bottom-0 h-3 w-2.5 ${tailColor} ${mine ? '-right-2' : '-left-2'}`}
              style={{
                clipPath: mine
                  ? 'polygon(0 0, 100% 100%, 0 100%)'
                  : 'polygon(100% 0, 100% 100%, 0 100%)',
              }}
            />
          )}

          {message.body && <p className="whitespace-pre-line">{message.body}</p>}

          {message.has_attachment && (
            <button
              onClick={() => onDownload(message)}
              className={`mt-1.5 flex max-w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${mine
                ? 'bg-white/15 text-white hover:bg-white/25'
                : 'bg-white text-brand-700 shadow-sm hover:bg-slate-50'
                }`}
            >
              <Paperclip className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{message.attachment_name}</span>
            </button>
          )}
        </div>

        {/* Delivered / Seen: ho an'ny hafatra nalefanao ihany */}
        {mine && (
          <p className="mt-1 flex items-center gap-1 px-1 text-[11px] text-slate-400">
            {seen ? (
              <>
                <CheckCheck className="h-3 w-3 text-brand-500" /> Seen at {time(message.read_at)}
              </>
            ) : (
              <>
                <Check className="h-3 w-3" /> Delivered
              </>
            )}
          </p>
        )}
      </div>
    </motion.div>
  )
}