<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case Pending = 'pending';
    case ProofSubmitted = 'proof_submitted';
    case Paid = 'paid';
    case Rejected = 'rejected';
    case Cancelled = 'cancelled';

    /** Paiement mbola miandry (manakana ny commande) */
    public function isOpen(): bool
    {
        return in_array($this, [self::Pending, self::ProofSubmitted], true);
    }
}