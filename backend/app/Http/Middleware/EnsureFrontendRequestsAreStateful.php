<?php

namespace App\Http\Middleware;

use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful as SanctumStateful;

class EnsureFrontendRequestsAreStateful extends SanctumStateful
{
    /**
     * Configure secure cookie sessions.
     *
     * Override Sanctum's default which forces SameSite=Lax.
     * Our SPA lives on different subdomains (colegio.intelicole.pe)
     * than the API (api.intelicole.pe), so we need SameSite=None
     * for cross-subdomain cookie transmission.
     */
    protected function configureSecureCookieSessions()
    {
        config([
            'session.http_only' => true,
            'session.same_site' => config('session.same_site', 'lax'),
            'session.secure' => config('session.secure', true),
        ]);
    }
}
