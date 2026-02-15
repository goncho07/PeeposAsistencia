<?php

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
