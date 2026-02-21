<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthSessionController;
use App\Http\Controllers\Auth\MobileAuthSessionController;
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
use App\Http\Controllers\AcademicYearController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\WhatsAppController;

Route::get('/tenants/{slug}', [TenantController::class, 'getBySlug'])
    ->name('tenants.show')
    ->middleware('throttle:30,1');

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
    Route::post('/execute-batch', [ImportController::class, 'executeBatch']);

    Route::post('/academic-years/bulk', [TenantController::class, 'bulkCreateAcademicYear']);

    Route::prefix('tenants/{id}/whatsapp')->group(function () {
        Route::get('/status', [WhatsAppController::class, 'status']);
        Route::get('/qr/{level}', [WhatsAppController::class, 'qr']);
        Route::post('/test', [WhatsAppController::class, 'sendTest']);
        Route::post('/port', [WhatsAppController::class, 'updatePort']);
    });
});

Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthSessionController::class, 'login'])
        ->name('auth.login')
        ->middleware('throttle:7,1');
});

Route::prefix('mobile/auth')->group(function () {
    Route::post('/login', [MobileAuthSessionController::class, 'login'])
        ->name('mobile.auth.login')
        ->middleware('throttle:7,1');
});

Route::middleware(['auth:sanctum', 'tenant.context', 'tenant.verify', 'tenant.active'])->group(function () {
    Route::prefix('auth')->group(function () {
        Route::get('/user', [AuthSessionController::class, 'user'])
            ->name('auth.user');

        Route::post('/logout', [AuthSessionController::class, 'logout'])
            ->name('auth.logout');

        Route::get('/sessions', [AuthSessionController::class, 'sessions'])
            ->name('auth.sessions');

        Route::delete('/sessions/{sessionId}', [AuthSessionController::class, 'revokeSession'])
            ->name('auth.sessions.revoke');

        Route::post('/logout-all', [AuthSessionController::class, 'logoutAll'])
            ->name('auth.logout-all');

        Route::post('/change-password', [AuthSessionController::class, 'changePassword'])
            ->name('auth.change-password');

        Route::put('/profile', [AuthSessionController::class, 'updateProfile'])
            ->name('auth.profile.update');
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

    Route::get('/teachers/my-schedule', [TeacherController::class, 'mySchedule'])
        ->middleware('tenant.role:DOCENTE');

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

    Route::prefix('classrooms')->group(function () {
        Route::middleware('tenant.role:DIRECTOR,SUBDIRECTOR,SECRETARIO,DOCENTE')->group(function () {
            Route::get('/', [ClassroomController::class, 'index']);
            Route::get('/{id}', [ClassroomController::class, 'show']);
        });

        Route::middleware('tenant.role:DIRECTOR,SUBDIRECTOR')->group(function () {
            Route::post('/', [ClassroomController::class, 'store']);
            Route::post('/bulk', [ClassroomController::class, 'bulkStore']);
            Route::put('/{id}', [ClassroomController::class, 'update']);
            Route::patch('/{id}', [ClassroomController::class, 'update']);
            Route::delete('/{id}', [ClassroomController::class, 'destroy']);
        });
    });

    Route::prefix('scanner')->middleware('tenant.role:ESCANER')->group(function () {
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

    Route::get('/attendance/my-attendance', [AttendanceController::class, 'myAttendance']);

    Route::prefix('attendance')->middleware('tenant.role:DIRECTOR,SUBDIRECTOR,SECRETARIO')->group(function () {
        Route::get('/', [AttendanceController::class, 'index']);
        Route::get('/daily-stats', [AttendanceController::class, 'getDailyStats']);
        Route::get('/weekly-stats', [AttendanceController::class, 'getWeeklyStats']);
        Route::post('/report', [AttendanceController::class, 'generateReport']);
    });

    Route::get('/attendance/classroom/{classroomId}/stats', [AttendanceController::class, 'classroomStats'])
        ->middleware('tenant.role:DIRECTOR,SUBDIRECTOR,SECRETARIO,DOCENTE');

    Route::prefix('justifications')->middleware('tenant.role:DIRECTOR,SUBDIRECTOR,SECRETARIO')->group(function () {
        Route::get('/', [JustificationController::class, 'index']);
        Route::get('/{id}', [JustificationController::class, 'show']);
        Route::post('/', [JustificationController::class, 'store']);
        Route::delete('/{id}', [JustificationController::class, 'destroy']);
    });

    Route::prefix('incidents')->middleware('tenant.role:DIRECTOR,SUBDIRECTOR,SECRETARIO,COORDINADOR,AUXILIAR,DOCENTE')->group(function () {
        Route::get('/', [IncidentController::class, 'index']);
        Route::get('/student/{studentId}', [IncidentController::class, 'byStudent']);
        Route::get('/{id}', [IncidentController::class, 'show']);
        Route::post('/', [IncidentController::class, 'store']);
        Route::put('/{id}', [IncidentController::class, 'update']);
        Route::patch('/{id}', [IncidentController::class, 'update']);
        Route::delete('/{id}', [IncidentController::class, 'destroy']);
    });

    Route::prefix('settings')->group(function () {
        Route::get('/', [SettingController::class, 'index']);
        Route::get('/attendable-types', [SettingController::class, 'attendableTypes']);
        Route::put('/', [SettingController::class, 'update']);
    });

    Route::prefix('academic-years')->group(function () {
        Route::get('/', [AcademicYearController::class, 'index']);
        Route::get('/current', [AcademicYearController::class, 'current']);
        Route::get('/{id}', [AcademicYearController::class, 'show']);

        Route::middleware('tenant.role:DIRECTOR')->group(function () {
            Route::post('/', [AcademicYearController::class, 'store']);
            Route::put('/{id}', [AcademicYearController::class, 'update']);
            Route::post('/{id}/activate', [AcademicYearController::class, 'activate']);
            Route::post('/{id}/finalize', [AcademicYearController::class, 'finalize']);
        });
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

Route::prefix('mobile/auth')
    ->middleware(['auth:sanctum', 'tenant.context', 'tenant.verify', 'tenant.active'])
    ->group(function () {
        Route::get('/user', [AuthSessionController::class, 'user'])
            ->name('mobile.auth.user');

        Route::post('/logout', [MobileAuthSessionController::class, 'logout'])
            ->name('mobile.auth.logout');

        Route::post('/refresh', [MobileAuthSessionController::class, 'refresh'])
            ->name('mobile.auth.refresh');

        Route::post('/logout-all', [MobileAuthSessionController::class, 'logoutAll'])
            ->name('mobile.auth.logout-all');

        Route::get('/sessions', [MobileAuthSessionController::class, 'sessions'])
            ->name('mobile.auth.sessions');

        Route::delete('/sessions/{tokenId}', [MobileAuthSessionController::class, 'revokeSession'])
            ->name('mobile.auth.sessions.revoke');

        Route::post('/change-password', [MobileAuthSessionController::class, 'changePassword'])
            ->name('mobile.auth.change-password');

        Route::put('/profile', [MobileAuthSessionController::class, 'updateProfile'])
            ->name('mobile.auth.profile.update');
    });