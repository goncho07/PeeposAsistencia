<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\NotificationController;

// Ruta de prueba para ver si funciona
Route::get('/ping', function () {
    return response()->json(['message' => 'Pong!']);
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::apiResource('users', UserController::class);
    Route::apiResource('attendance', AttendanceController::class);
    Route::apiResource('settings', SettingController::class);
    Route::apiResource('notifications', NotificationController::class);
});