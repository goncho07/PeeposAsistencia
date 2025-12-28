<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'tenant.context' => \App\Http\Middleware\Tenant\SetTenantContext::class,
            'tenant.verify' => \App\Http\Middleware\Tenant\VerifyTenantAccess::class,
            'tenant.active' => \App\Http\Middleware\Tenant\EnsureTenantIsActive::class,
            'role' => \App\Http\Middleware\Tenant\CheckRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->shouldRenderJsonWhen(function (Request $request) {
            return $request->is('api/*');
        });
    })
    ->withSchedule(function (Schedule $schedule) {
        $schedule->command('attendance:generate-absences')->dailyAt('23:59');
        $schedule->command('carnets:cleanup')->daily();
    })
    ->create();