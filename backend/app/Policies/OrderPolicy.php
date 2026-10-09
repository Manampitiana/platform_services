<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class OrderPolicy
{
    // Ny admin dia tsy manao commande
    public function create(User $user): Response
    {
        return $user->isAdmin()
            ? Response::deny('Administrator accounts cannot place orders. Use a client account.')
            : Response::allow();
    }

    public function view(User $user, Order $order): bool
    {
        return $user->isAdmin() || $order->user_id === $user->id;
    }

    // Hetsika an'ny client: brief, submit, fichier, paiement, devis, approbation, révision
    public function update(User $user, Order $order): bool
    {
        return ! $user->isAdmin() && $order->user_id === $user->id;
    }

    public function message(User $user, Order $order): bool
    {
        // Admin tsy mifampiresaka amin'ny tenany
        if ($user->isAdmin() && $order->user_id === $user->id) {
            return false;
        }

        return $this->view($user, $order)
            && ! in_array($order->status->value, ['draft', 'cancelled', 'refunded'], true);
    }

    // Hetsika an'ny admin: tsy azo atao amin'ny commande an'ny tenany
    public function manage(User $user, Order $order): Response
    {
        if (! $user->isAdmin()) {
            return Response::deny();
        }

        return $order->user_id === $user->id
            ? Response::deny('You cannot manage your own order. Ask another administrator.')
            : Response::allow();
    }
}