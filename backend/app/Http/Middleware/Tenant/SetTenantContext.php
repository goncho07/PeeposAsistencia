<?php

namespace App\Http\Middleware\Tenant;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetTenantContext
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && $request->user()->tenant_id) {
            app()->instance('current_tenant_id', $request->user()->tenant_id);
            app()->instance('current_tenant', $request->user()->tenant);

            if ($tenant = $request->user()->tenant) {
                config(['app.timezone' => $tenant->timezone]);
                date_default_timezone_set($tenant->timezone);
            }
        }

        return $next($request);
    }
}
