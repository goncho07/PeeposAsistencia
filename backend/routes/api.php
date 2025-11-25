<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AttendanceRecordController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\NotificationController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Obtener usuario autenticado
Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

// Rutas protegidas del sistema
Route::middleware(['auth:sanctum'])->group(function () {
    // Gestión de Usuarios
    Route::apiResource('users', UserController::class);

    // Registros de Asistencia
    // Nota: Usamos 'attendance' en la URL pero el controlador maneja la tabla records
    Route::apiResource('attendance', AttendanceRecordController::class);

    // Configuraciones
    Route::apiResource('settings', SettingController::class);

    // Notificaciones
    Route::apiResource('notifications', NotificationController::class);
});
