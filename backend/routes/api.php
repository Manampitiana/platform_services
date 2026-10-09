<?php

use App\Http\Controllers\Api\V1\Admin\AdminContactMessageController;
use App\Http\Controllers\Api\V1\Admin\AdminDashboardController;
use App\Http\Controllers\Api\V1\Admin\AdminDeliverableController;
use App\Http\Controllers\Api\V1\Admin\AdminOrderController;
use App\Http\Controllers\Api\V1\Admin\AdminPaymentController;
use App\Http\Controllers\Api\V1\Admin\AdminPackageController;
use App\Http\Controllers\Api\V1\Admin\AdminPaymentMethodController;
use App\Http\Controllers\Api\V1\Admin\AdminServiceController;
use App\Http\Controllers\Api\V1\Admin\AdminQuoteController;

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\ContactController;
use App\Http\Controllers\Api\V1\DeliverableController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\OrderFileController;
use App\Http\Controllers\Api\V1\OrderMessageController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\ServiceController;
use App\Http\Controllers\Api\V1\EmailVerificationController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\PasswordResetController;
use App\Http\Controllers\Api\V1\QuoteController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::prefix('v1')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

    Route::post('/forgot-password', [PasswordResetController::class, 'forgot'])->middleware('throttle:5,1');
    Route::post('/reset-password', [PasswordResetController::class, 'reset'])->middleware('throttle:5,1');

    Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:5,10');

    // Ilaina ny anarana "verification.verify" (ampiasain'ny AppServiceProvider)
    Route::post('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');

    // Public catalogue
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/services', [ServiceController::class, 'index']);
    Route::get('/services/{slug}', [ServiceController::class, 'show']);

    // Auth (protégé)
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);

        Route::post('/email/send-code', [EmailVerificationController::class, 'send'])->middleware('throttle:6,1');
        Route::post('/email/verify-code', [EmailVerificationController::class, 'verify'])->middleware('throttle:10,1');
        Route::post('/email/change', [EmailVerificationController::class, 'changeEmail'])->middleware('throttle:5,1');

        Route::middleware('verified')->group(function () {

            Route::patch('/profile', [ProfileController::class, 'update']);
            Route::put('/profile/password', [ProfileController::class, 'updatePassword']);

            Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar'])->middleware('throttle:10,1');
            Route::delete('/profile/avatar', [ProfileController::class, 'destroyAvatar']);

            Route::post('/email/resend', [EmailVerificationController::class, 'resend'])->middleware('throttle:3,1');

            Route::get('/notifications', [NotificationController::class, 'index']);
            Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);
            Route::post('/notifications/{id}/read', [NotificationController::class, 'markRead']);

            Route::get('/orders', [OrderController::class, 'index']);
            Route::get('/orders/summary', [OrderController::class, 'summary']);
            Route::post('/orders', [OrderController::class, 'store'])->middleware('verified');
            Route::get('/orders/{order}', [OrderController::class, 'show']);
            Route::patch('/orders/{order}/brief', [OrderController::class, 'updateBrief']);
            Route::post('/orders/{order}/submit', [OrderController::class, 'submit'])->middleware('verified');


            Route::post('/orders/{order}/files', [OrderFileController::class, 'store']);
            Route::delete('/orders/{order}/files/{file}', [OrderFileController::class, 'destroy']);
            Route::get('/orders/{order}/files/{file}/download', [OrderFileController::class, 'download']);

            // Quotes
            Route::get('/orders/{order}/quotes', [QuoteController::class, 'index']);
            Route::post('/quotes/{quote}/accept', [QuoteController::class, 'accept']);
            Route::post('/quotes/{quote}/reject', [QuoteController::class, 'reject']);

            // Paiement (client)
            Route::get('/payment-methods', [PaymentController::class, 'methods']);
            Route::post('/orders/{order}/payments', [PaymentController::class, 'store'])->middleware(['verified', 'throttle:10,1']);
            Route::get('/payments/{payment}/proof', [PaymentController::class, 'proof']);

            // Messages
            Route::get('/orders/{order}/messages', [OrderMessageController::class, 'index']);
            Route::post('/orders/{order}/messages', [OrderMessageController::class, 'store'])->middleware('throttle:30,1');
            Route::get('/orders/{order}/messages/{message}/attachment', [OrderMessageController::class, 'attachment']);
            Route::get('/messages/unread', [OrderMessageController::class, 'unread']);
            Route::delete('/orders/{order}/messages/{message}', [OrderMessageController::class, 'destroy']);

            // Livrables (client)
            Route::get('/deliverables/{deliverable}/download', [DeliverableController::class, 'download']);
            Route::post('/deliverables/{deliverable}/approve', [DeliverableController::class, 'approve']);
            Route::post('/deliverables/{deliverable}/revision-request', [DeliverableController::class, 'requestRevision']);

            // Admin
            Route::prefix('admin')->middleware('admin')->group(function () {
                Route::get('/dashboard', AdminDashboardController::class);

                Route::get('/orders', [AdminOrderController::class, 'index']);
                Route::get('/orders/{order}', [AdminOrderController::class, 'show']);
                Route::patch('/orders/{order}/status', [AdminOrderController::class, 'changeStatus']);
                Route::post('/orders/{order}/price', [AdminOrderController::class, 'setPrice']);

                Route::post('/orders/{order}/deliverables', [AdminDeliverableController::class, 'store']);

                Route::post('/orders/{order}/quotes', [AdminQuoteController::class, 'store']);
                Route::put('/quotes/{quote}', [AdminQuoteController::class, 'update']);
                Route::post('/quotes/{quote}/send', [AdminQuoteController::class, 'send']);
                Route::delete('/quotes/{quote}', [AdminQuoteController::class, 'destroy']);

                Route::get('/payments', [AdminPaymentController::class, 'index']);
                Route::post('/payments/{payment}/verify', [AdminPaymentController::class, 'verify']);
                Route::post('/payments/{payment}/reject', [AdminPaymentController::class, 'reject']);

                Route::get('/payment-methods', [AdminPaymentMethodController::class, 'index']);
                Route::post('/payment-methods', [AdminPaymentMethodController::class, 'store']);
                Route::patch('/payment-methods/{paymentMethod}', [AdminPaymentMethodController::class, 'update']);
                Route::delete('/payment-methods/{paymentMethod}', [AdminPaymentMethodController::class, 'destroy']);

                Route::get('/services', [AdminServiceController::class, 'index']);
                Route::post('/services', [AdminServiceController::class, 'store']);
                Route::get('/services/{service}', [AdminServiceController::class, 'show']);
                Route::patch('/services/{service}', [AdminServiceController::class, 'update']);
                Route::delete('/services/{service}', [AdminServiceController::class, 'destroy']);
                Route::put('/services/{service}/features', [AdminServiceController::class, 'saveFeatures']);
                Route::put('/services/{service}/form-fields', [AdminServiceController::class, 'saveFormFields']);

                Route::post('/services/{service}/packages', [AdminPackageController::class, 'store']);
                Route::patch('/packages/{package}', [AdminPackageController::class, 'update']);
                Route::delete('/packages/{package}', [AdminPackageController::class, 'destroy']);

                Route::get('/contact-messages', [AdminContactMessageController::class, 'index']);
                Route::get('/contact-messages/count', [AdminContactMessageController::class, 'count']);
                Route::post('/contact-messages/{contactMessage}/handle', [AdminContactMessageController::class, 'handle']);
                Route::post('/contact-messages/{contactMessage}/reopen', [AdminContactMessageController::class, 'reopen']);
                Route::delete('/contact-messages/{contactMessage}', [AdminContactMessageController::class, 'destroy']);
            });
        });
    });
});
