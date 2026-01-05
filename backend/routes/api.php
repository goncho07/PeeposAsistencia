<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Students\StudentController;
use App\Http\Controllers\Teachers\TeacherController;
use App\Http\Controllers\Parents\ParentController;
use App\Http\Controllers\Users\UserController;
use App\Http\Controllers\Classrooms\ClassroomController;
use App\Http\Controllers\Attendance\ScannerController;
use App\Http\Controllers\Attendance\AttendanceController;
use App\Http\Controllers\Attendance\JustificationController;
use App\Http\Controllers\Carnets\CarnetController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\TenantController;

Route::get('/ping', function () {
    return response()->json(['message' => 'Pong!']);
});

Route::get('/tenants/{slug}', [TenantController::class, 'getBySlug'])
    ->name('tenants.show');

Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthenticatedSessionController::class, 'login'])
        ->name('auth.login')
        ->middleware('throttle:7,1');
});

Route::middleware(['auth:sanctum', 'tenant.context', 'tenant.verify', 'tenant.active'])->group(function () {
    Route::prefix('auth')->group(function () {
        Route::get('/user', [AuthenticatedSessionController::class, 'user'])
            ->name('auth.user');

        Route::post('/logout', [AuthenticatedSessionController::class, 'logout'])
            ->name('auth.logout');

        Route::post('/logout-all', [AuthenticatedSessionController::class, 'logoutAll'])
            ->name('auth.logout-all');

        Route::post('/refresh', [AuthenticatedSessionController::class, 'refresh'])
            ->name('auth.refresh');

        Route::get('/sessions', [AuthenticatedSessionController::class, 'sessions'])
            ->name('auth.sessions');

        Route::delete('/sessions/{tokenId}', [AuthenticatedSessionController::class, 'revokeSession'])
            ->name('auth.sessions.revoke');
    });

    Route::prefix('carnets')->group(function () {
        Route::post('/generate', [CarnetController::class, 'generate'])
            ->name('carnets.generate');
        Route::get('/status/{jobId}', [CarnetController::class, 'status'])
            ->name('carnets.status');
        Route::get('/download/{jobId}', [CarnetController::class, 'download'])
            ->name('carnets.download');
        Route::delete('/{jobId}', [CarnetController::class, 'cancel'])
            ->name('carnets.cancel');
    });

    Route::prefix('students')->middleware('tenant.role:DIRECTOR,SUBDIRECTOR,SECRETARIO')->group(function () {
        Route::get('/', [StudentController::class, 'index']);
        Route::get('/{id}', [StudentController::class, 'show']);
        Route::post('/', [StudentController::class, 'store']);
        Route::put('/{id}', [StudentController::class, 'update']);
        Route::patch('/{id}', [StudentController::class, 'update']);
        Route::delete('/{id}', [StudentController::class, 'destroy']);
    });

    Route::prefix('teachers')->middleware('tenant.role:DIRECTOR,SUBDIRECTOR')->group(function () {
        Route::get('/', [TeacherController::class, 'index']);
        Route::get('/{id}', [TeacherController::class, 'show']);
        Route::post('/', [TeacherController::class, 'store']);
        Route::put('/{id}', [TeacherController::class, 'update']);
        Route::patch('/{id}', [TeacherController::class, 'update']);
        Route::delete('/{id}', [TeacherController::class, 'destroy']);
    });

    Route::prefix('parents')->middleware('tenant.role:DIRECTOR,SUBDIRECTOR,SECRETARIO')->group(function () {
        Route::get('/', [ParentController::class, 'index']);
        Route::get('/{id}', [ParentController::class, 'show']);
        Route::post('/', [ParentController::class, 'store']);
        Route::put('/{id}', [ParentController::class, 'update']);
        Route::patch('/{id}', [ParentController::class, 'update']);
        Route::delete('/{id}', [ParentController::class, 'destroy']);
    });

    Route::prefix('users')->middleware('tenant.role:DIRECTOR')->group(function () {
        Route::get('/', [UserController::class, 'index']);
        Route::get('/{id}', [UserController::class, 'show']);
        Route::post('/', [UserController::class, 'store']);
        Route::put('/{id}', [UserController::class, 'update']);
        Route::patch('/{id}', [UserController::class, 'update']);
        Route::delete('/{id}', [UserController::class, 'destroy']);
    });

    Route::prefix('classrooms')->middleware('tenant.role:DIRECTOR,SUBDIRECTOR')->group(function () {
        Route::get('/', [ClassroomController::class, 'index']);
        Route::get('/{id}', [ClassroomController::class, 'show']);
        Route::post('/', [ClassroomController::class, 'store']);
        Route::put('/{id}', [ClassroomController::class, 'update']);
        Route::patch('/{id}', [ClassroomController::class, 'update']);
        Route::delete('/{id}', [ClassroomController::class, 'destroy']);

        Route::get('/by-level/{level}', [ClassroomController::class, 'byLevel']);
        Route::get('/by-teacher/{teacherId}', [ClassroomController::class, 'byTeacher']);
    });

    Route::prefix('scanner')->group(function () {
        Route::post('/entry', [ScannerController::class, 'scanEntry']);
        Route::post('/exit', [ScannerController::class, 'scanExit']);
    });

    Route::prefix('attendance')->middleware('tenant.role:DIRECTOR,SUBDIRECTOR,SECRETARIO')->group(function () {
        Route::get('/', [AttendanceController::class, 'index']);
        Route::get('/daily-stats', [AttendanceController::class, 'getDailyStats']);
        Route::post('/report', [AttendanceController::class, 'generateReport']);
    });

    Route::prefix('justifications')->middleware('tenant.role:DIRECTOR,SUBDIRECTOR,SECRETARIO')->group(function () {
        Route::get('/', [JustificationController::class, 'index']);
        Route::get('/{id}', [JustificationController::class, 'show']);
        Route::post('/', [JustificationController::class, 'store']);
        Route::delete('/{id}', [JustificationController::class, 'destroy']);
    });

    Route::prefix('settings')->group(function () {
        Route::get('/', [SettingController::class, 'index']);
        Route::put('/', [SettingController::class, 'update']);
    });
});