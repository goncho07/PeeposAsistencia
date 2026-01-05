<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name' => 'Peepos Asistencia API',
        'version' => '1.0.0',
        'status' => 'running',
        'documentation' => null,
        'endpoints' => [
            'health' => '/api/ping',
            'auth' => '/api/auth/login',
        ]
    ]);
});
