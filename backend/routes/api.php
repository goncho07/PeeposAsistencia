<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Attendance\ScannerController;
use App\Http\Controllers\Attendance\BiometricScannerController;
use App\Http\Controllers\Attendance\AttendanceController;
use App\Http\Controllers\Attendance\JustificationController;
use App\Http\Controllers\Incidents\IncidentController;
use App\Http\Controllers\Carnets\CarnetController;
use App\Http\Controllers\Calendar\CalendarEventController;
use App\Http\Controllers\ClassroomController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\ParentController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\TenantController;
use App\Http\Controllers\ImportController;

Route::get('/tenants/{slug}', [TenantController::class, 'getBySlug'])
    ->name('tenants.show');

Route::prefix('superadmin')->middleware(['auth:sanctum', 'tenant.role:SUPERADMIN'])->group(function () {
    Route::get('/stats', [TenantController::class, 'stats']);

    Route::post('/tenants/{id}/enter', [TenantController::class, 'enterTenant']);
    Route::post('/exit', [TenantController::class, 'exitTenant']);

    Route::get('/tenants', [TenantController::class, 'index']);
    Route::post('/tenants', [TenantController::class, 'store']);
    Route::get('/tenants/{id}', [TenantController::class, 'show']);
    Route::put('/tenants/{id}', [TenantController::class, 'update']);
    Route::delete('/tenants/{id}', [TenantController::class, 'destroy']);
    Route::post('/tenants/{id}/toggle-active', [TenantController::class, 'toggleActive']);
    Route::post('/tenants/{id}/upload-image', [TenantController::class, 'uploadImage']);

    Route::post('/validate', [ImportController::class, 'validate']);
    Route::post('/execute', [ImportController::class, 'execute']);
});

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
        Route::post('/count', [CarnetController::class, 'count'])
            ->name('carnets.count');
        Route::get('/download/{path}', [CarnetController::class, 'downloadDirect'])
            ->name('carnets.download.direct');
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
    });

    Route::prefix('scanner')->group(function () {
        Route::post('/entry', [ScannerController::class, 'scanEntry']);
        Route::post('/exit', [ScannerController::class, 'scanExit']);
    });

    Route::prefix('biometric')->group(function () {
        Route::post('/scan/entry', [BiometricScannerController::class, 'scanEntry']);
        Route::post('/scan/exit', [BiometricScannerController::class, 'scanExit']);
        Route::get('/health', [BiometricScannerController::class, 'health']);
        Route::get('/status/{type}/{id}', [BiometricScannerController::class, 'status']);

        Route::middleware('tenant.role:DIRECTOR,SUBDIRECTOR')->group(function () {
            Route::post('/enroll', [BiometricScannerController::class, 'enroll']);
        });
    });

    Route::prefix('attendance')->middleware('tenant.role:DIRECTOR,SUBDIRECTOR,SECRETARIO')->group(function () {
        Route::get('/', [AttendanceController::class, 'index']);
        Route::get('/daily-stats', [AttendanceController::class, 'getDailyStats']);
        Route::post('/report', [AttendanceController::class, 'generateReport']);
        Route::post('/behavior-statistics', [AttendanceController::class, 'getBehaviorStatistics']);
    });

    Route::prefix('justifications')->middleware('tenant.role:DIRECTOR,SUBDIRECTOR,SECRETARIO')->group(function () {
        Route::get('/', [JustificationController::class, 'index']);
        Route::get('/{id}', [JustificationController::class, 'show']);
        Route::post('/', [JustificationController::class, 'store']);
        Route::delete('/{id}', [JustificationController::class, 'destroy']);
    });

    Route::prefix('incidents')->middleware('tenant.role:DIRECTOR,SUBDIRECTOR,SECRETARIO')->group(function () {
        Route::get('/', [IncidentController::class, 'index']);
        Route::get('/types', [IncidentController::class, 'types']);
        Route::get('/severities', [IncidentController::class, 'severities']);
        Route::get('/statistics', [IncidentController::class, 'statistics']);
        Route::get('/student/{studentId}', [IncidentController::class, 'byStudent']);
        Route::get('/{id}', [IncidentController::class, 'show']);
        Route::post('/', [IncidentController::class, 'store']);
        Route::put('/{id}', [IncidentController::class, 'update']);
        Route::patch('/{id}', [IncidentController::class, 'update']);
        Route::delete('/{id}', [IncidentController::class, 'destroy']);
    });

    Route::prefix('settings')->group(function () {
        Route::get('/', [SettingController::class, 'index']);
        Route::put('/', [SettingController::class, 'update']);
    });

    Route::prefix('calendar')->group(function () {
        Route::get('/events', [CalendarEventController::class, 'index']);
        Route::get('/events/{id}', [CalendarEventController::class, 'show']);

        Route::middleware('tenant.role:DIRECTOR')->group(function () {
            Route::post('/events', [CalendarEventController::class, 'store']);
            Route::put('/events/{id}', [CalendarEventController::class, 'update']);
            Route::delete('/events/{id}', [CalendarEventController::class, 'destroy']);
        });
    });
});