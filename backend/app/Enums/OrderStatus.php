<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Draft = 'draft';
    case Submitted = 'submitted';
    case UnderReview = 'under_review';
    case QuotePending = 'quote_pending';
    case QuoteSent = 'quote_sent';
    case AwaitingPayment = 'awaiting_payment';
    case Paid = 'paid';
    case InProgress = 'in_progress';
    case Revision = 'revision';
    case Delivered = 'delivered';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
    case Refunded = 'refunded';

    /** @return array<int, self> */
    public function allowedTransitions(): array
    {
        return match ($this) {
            self::Draft => [self::Submitted, self::Cancelled],
            self::Submitted => [self::UnderReview, self::QuotePending, self::AwaitingPayment, self::Cancelled],
            self::UnderReview => [self::QuotePending, self::AwaitingPayment, self::Cancelled],
            self::QuotePending => [self::QuoteSent, self::Cancelled],
            self::QuoteSent => [self::QuotePending, self::AwaitingPayment, self::Cancelled],
            self::AwaitingPayment => [self::Paid, self::Cancelled],
            self::Paid => [self::InProgress, self::Refunded],
            self::InProgress => [self::Delivered, self::Cancelled],
            self::Delivered => [self::Revision, self::Completed],
            self::Revision => [self::Delivered],
            self::Completed, self::Cancelled, self::Refunded => [],
        };
    }

    public function canTransitionTo(self $to): bool
    {
        return in_array($to, $this->allowedTransitions(), true);
    }
}