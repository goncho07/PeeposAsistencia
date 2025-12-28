<?php

namespace App\Http\Middleware\Tenant;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class VerifyTenantAccess
{
    /**
     * Handle an incoming request.
     *
     * Verifies that the authenticated user's tenant_id matches the tenant context.
     * This provides defense-in-depth against tenant isolation bypass attempts.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->role === 'SUPERADMIN') {
            return $next($request);
        }

        if ($user && $user->tenant_id) {
            $currentTenantId = app()->bound('current_tenant_id') ? app('current_tenant_id') : null;

            if ($currentTenantId && $currentTenantId !== $user->tenant_id) {
            
                return response()->json([
                    'message' => 'ACCESO DENEGADO: No tienes permisos para acceder a este recurso',
                    'error' => 'TENANT_ACCESS_DENIED',
                ], 403);
            }
        }

        return $next($request);
    }
}
