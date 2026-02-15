<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Http\Request;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Session\TokenMismatchException;
use Symfony\Component\HttpKernel\Exception\HttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->statefulApi();

        $middleware->api(replace: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class =>
            \App\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        $middleware->trustProxies(at: '*');

        $middleware->alias([
            'tenant.context' => \App\Http\Middleware\Tenant\SetTenantContext::class,
            'tenant.verify' => \App\Http\Middleware\Tenant\VerifyTenantAccess::class,
            'tenant.active' => \App\Http\Middleware\Tenant\EnsureTenantIsActive::class,
            'tenant.role' => \App\Http\Middleware\Tenant\CheckTenantRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->shouldRenderJsonWhen(function (Request $request) {
            return $request->is('api/*') || $request->expectsJson();
        });

        $exceptions->render(function (TokenMismatchException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'message' => 'Token CSRF inválido o sesión expirada. Recargue la página.',
                    'error' => 'CSRF_MISMATCH',
                ], 419);
            }
        });

        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'message' => 'No autenticado. Por favor inicie sesión.',
                    'error' => 'UNAUTHENTICATED',
                ], 401);
            }
        });

        $exceptions->render(function (HttpException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                $message = match ($e->getStatusCode()) {
                    401 => 'No autenticado. Por favor inicie sesión.',
                    403 => 'No tiene permisos para realizar esta acción.',
                    404 => 'Recurso no encontrado.',
                    405 => 'Método HTTP no permitido.',
                    419 => 'Sesión expirada. Por favor recargue la página.',
                    429 => 'Demasiadas solicitudes. Intente más tarde.',
                    500 => 'Error interno del servidor.',
                    503 => 'Servicio no disponible temporalmente.',
                    default => $e->getMessage() ?: 'Error en la solicitud.',
                };

                return response()->json([
                    'message' => $message,
                    'error' => match ($e->getStatusCode()) {
                        401 => 'UNAUTHENTICATED',
                        403 => 'FORBIDDEN',
                        404 => 'NOT_FOUND',
                        419 => 'SESSION_EXPIRED',
                        429 => 'TOO_MANY_REQUESTS',
                        default => 'HTTP_ERROR',
                    },
                ], $e->getStatusCode());
            }
        });
    })
    ->withSchedule(function (Schedule $schedule) {
        $schedule->command('attendance:generate-absences')->dailyAt('23:59');
        $schedule->command('carnets:cleanup')->daily();
    })
    ->create();
