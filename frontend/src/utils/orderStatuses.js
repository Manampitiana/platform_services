export const statuses = {
  draft: { label: 'Draft', tone: 'gray' },
  submitted: { label: 'Submitted', tone: 'blue' },
  under_review: { label: 'Under review', tone: 'blue' },
  quote_pending: { label: 'Quote pending', tone: 'yellow' },
  quote_sent: { label: 'Quote sent', tone: 'purple' },
  awaiting_payment: { label: 'Awaiting payment', tone: 'yellow' },
  paid: { label: 'Paid', tone: 'green' },
  in_progress: { label: 'In progress', tone: 'blue' },
  revision: { label: 'Revision', tone: 'yellow' },
  delivered: { label: 'Delivered', tone: 'purple' },
  completed: { label: 'Completed', tone: 'green' },
  cancelled: { label: 'Cancelled', tone: 'red' },
  refunded: { label: 'Refunded', tone: 'gray' },
}

export const paymentStatuses = {
  pending: { label: 'Pending', tone: 'gray' },
  proof_submitted: { label: 'Awaiting verification', tone: 'yellow' },
  paid: { label: 'Paid', tone: 'green' },
  rejected: { label: 'Rejected', tone: 'red' },
  cancelled: { label: 'Cancelled', tone: 'gray' },
}

export const quoteStatuses = {
  draft: { label: 'Draft', tone: 'gray' },
  sent: { label: 'Awaiting your answer', tone: 'purple' },
  accepted: { label: 'Accepted', tone: 'green' },
  rejected: { label: 'Declined', tone: 'red' },
  expired: { label: 'Expired', tone: 'gray' },
  superseded: { label: 'Replaced by a newer version', tone: 'gray' },
}