<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Users\UserController;
use App\Http\Controllers\Attendance\ScannerController;
use App\Http\Controllers\Attendance\AttendanceController;
use App\Http\Controllers\Attendance\JustificationController;
use App\Http\Controllers\AulaController;
use App\Http\Controllers\CarnetController;
use App\Http\Controllers\SettingController;

Route::get('/ping', function () {
    return response()->json(['message' => 'Pong!']);
});

Route::post('/login', [AuthenticatedSessionController::class, 'store']);

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

    Route::get('/validate-token', [AuthenticatedSessionController::class, 'show']);
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy']);
    Route::post('/logout-all', [AuthenticatedSessionController::class, 'destroyAll']);

    Route::post('/carnets/generate', [CarnetController::class, 'generate']);

    Route::prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index']);
        Route::get('/{id}', [UserController::class, 'show']);

        Route::post('/admin',   [UserController::class, 'storeUser']);
        Route::post('/student', [UserController::class, 'storeStudent']);
        Route::post('/teacher', [UserController::class, 'storeTeacher']);
        Route::post('/parent',  [UserController::class, 'storeParent']);

        Route::put('/admin/{id}',   [UserController::class, 'updateUser']);
        Route::put('/student/{id}', [UserController::class, 'updateStudent']);
        Route::put('/teacher/{id}', [UserController::class, 'updateTeacher']);
        Route::put('/parent/{id}',  [UserController::class, 'updateParent']);

        Route::delete('/{id}', [UserController::class, 'destroy']);
    });

    Route::apiResource('aulas', AulaController::class)->only(['index', 'show']);

    Route::prefix('scanner')->group(function () {
        Route::post('/entry', [ScannerController::class, 'scanEntry']);
        Route::post('/exit', [ScannerController::class, 'scanExit']);
    });

    Route::prefix('attendance')->group(function () {
        Route::get('/daily-stats', [AttendanceController::class, 'getDailyStats']);
        Route::post('/report', [AttendanceController::class, 'generateReport']);
    });

    Route::prefix('justifications')->group(function () {
        Route::get('/', [JustificationController::class, 'index']);
        Route::post('/', [JustificationController::class, 'store']);
        Route::post('/{id}/approve', [JustificationController::class, 'approve']);
        Route::post('/{id}/reject', [JustificationController::class, 'reject']);
        Route::delete('/{id}', [JustificationController::class, 'destroy']);
    });

    Route::prefix('settings')->group(function () {
        Route::get('/', [SettingController::class, 'index']);
        Route::put('/', [SettingController::class, 'update']);
    });
});

Route::fallback(function () {
    return response()->json([
        'message' => 'Ruta no encontrada.',
    ], 404);
});