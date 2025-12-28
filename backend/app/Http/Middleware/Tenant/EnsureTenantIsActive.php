<?php

namespace App\Http\Middleware\Tenant;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTenantIsActive
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()?->role === 'SUPERADMIN') {
            return $next($request);
        }

        $tenant = $request->user()?->tenant;

        if (!$tenant) {
            return response()->json([
                'message' => 'No tenant associated with this user',
                'error' => 'TENANT_NOT_FOUND',
            ], 403);
        }

        if (!$tenant->is_active) {
            return response()->json([
                'message' => 'Tu institución está inactiva. Contacta al soporte.',
                'error' => 'TENANT_INACTIVE',
            ], 403);
        }

        $tenant->updateActivity();

        return $next($request);
    }
}
