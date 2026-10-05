<?php

namespace Tests\Unit;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

class OrderStatusTest extends TestCase
{
    public static function allowed(): array
    {
        return [
            'draft → submitted' => [OrderStatus::Draft, OrderStatus::Submitted],
            'submitted → awaiting payment' => [OrderStatus::Submitted, OrderStatus::AwaitingPayment],
            'submitted → quote pending' => [OrderStatus::Submitted, OrderStatus::QuotePending],
            'quote pending → quote sent' => [OrderStatus::QuotePending, OrderStatus::QuoteSent],
            'quote sent → awaiting payment' => [OrderStatus::QuoteSent, OrderStatus::AwaitingPayment],
            'quote sent → quote pending' => [OrderStatus::QuoteSent, OrderStatus::QuotePending],
            'awaiting payment → paid' => [OrderStatus::AwaitingPayment, OrderStatus::Paid],
            'paid → in progress' => [OrderStatus::Paid, OrderStatus::InProgress],
            'in progress → delivered' => [OrderStatus::InProgress, OrderStatus::Delivered],
            'delivered → revision' => [OrderStatus::Delivered, OrderStatus::Revision],
            'revision → delivered' => [OrderStatus::Revision, OrderStatus::Delivered],
            'delivered → completed' => [OrderStatus::Delivered, OrderStatus::Completed],
        ];
    }

    public static function forbidden(): array
    {
        return [
            'draft → delivered' => [OrderStatus::Draft, OrderStatus::Delivered],
            'draft → paid' => [OrderStatus::Draft, OrderStatus::Paid],
            'submitted → paid' => [OrderStatus::Submitted, OrderStatus::Paid],
            'awaiting payment → in progress (tsy mandoa)' => [OrderStatus::AwaitingPayment, OrderStatus::InProgress],
            'awaiting payment → completed' => [OrderStatus::AwaitingPayment, OrderStatus::Completed],
            'paid → delivered' => [OrderStatus::Paid, OrderStatus::Delivered],
            'in progress → completed' => [OrderStatus::InProgress, OrderStatus::Completed],
            'delivered → in progress' => [OrderStatus::Delivered, OrderStatus::InProgress],
            'completed → in progress' => [OrderStatus::Completed, OrderStatus::InProgress],
            'cancelled → submitted' => [OrderStatus::Cancelled, OrderStatus::Submitted],
            'refunded → paid' => [OrderStatus::Refunded, OrderStatus::Paid],
        ];
    }

    #[DataProvider('allowed')]
    public function test_allowed_transitions(OrderStatus $from, OrderStatus $to): void
    {
        $this->assertTrue($from->canTransitionTo($to));
    }

    #[DataProvider('forbidden')]
    public function test_forbidden_transitions(OrderStatus $from, OrderStatus $to): void
    {
        $this->assertFalse($from->canTransitionTo($to));
    }

    public function test_final_statuses_have_no_exit(): void
    {
        foreach ([OrderStatus::Completed, OrderStatus::Cancelled, OrderStatus::Refunded] as $status) {
            $this->assertSame([], $status->allowedTransitions());
        }
    }

    public function test_only_unprocessed_payments_are_open(): void
    {
        $this->assertTrue(PaymentStatus::Pending->isOpen());
        $this->assertTrue(PaymentStatus::ProofSubmitted->isOpen());
        $this->assertFalse(PaymentStatus::Paid->isOpen());
        $this->assertFalse(PaymentStatus::Rejected->isOpen());
        $this->assertFalse(PaymentStatus::Cancelled->isOpen());
    }
}