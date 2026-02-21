<?php

use App\Http\Controllers\Auth\GoogleAuthController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name' => 'Intelicole API',
        'version' => '1.0.9',
        'status' => 'running',
        'documentation' => null,
        'endpoints' => [
            'auth' => '/api/auth/login',
        ]
    ]);
});

Route::get('/auth/google/redirect', [GoogleAuthController::class, 'redirect']);
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback']);
