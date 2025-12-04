<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\NotificationController;

Route::post('/login', [AuthController::class, 'login']);

Route::get('/ping', function () {
    return response()->json(['message' => 'Pong!']);
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', function (Request $request) {
        return response()->json([
            'user' => [
                'id' => $request->user()->id,
                'name' => $request->user()->name,
                'email' => $request->user()->email,
                'rol' => $request->user()->rol,
                'avatar_url' => $request->user()->avatar_url,
            ],
        ]);
    });

    Route::get('/validate-token', [AuthController::class, 'validateToken']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/logout-all', [AuthController::class, 'logoutAll']);

    Route::apiResource('users', UsersController::class);
    Route::apiResource('attendance', AttendanceController::class);
    Route::apiResource('settings', SettingController::class);
    Route::apiResource('notifications', NotificationController::class);
});

Route::fallback(function () {
    return response()->json([
        'message' => 'Ruta no encontrada.',
    ], 404);
});