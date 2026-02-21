<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    use LogsActivity;

    /**
     * Redirect the user to Google's OAuth consent screen.
     *
     * GET /auth/google/redirect
     */
    public function redirect(Request $request)
    {
        $request->validate([
            'context' => ['required', 'in:tenant,admin'],
            'tenant_slug' => ['required_if:context,tenant', 'nullable', 'string'],
        ]);

        $state = base64_encode(json_encode([
            'context' => $request->input('context'),
            'tenant_slug' => $request->input('tenant_slug'),
        ]));

        return Socialite::driver('google')
            ->stateless()
            ->with(['state' => $state])
            ->redirect();
    }

    /**
     * Handle the callback from Google.
     *
     * GET /auth/google/callback
     */
    public function callback(Request $request)
    {
        try {
            $state = json_decode(base64_decode($request->input('state', '')), true);
            $context = $state['context'] ?? 'tenant';
            $tenantSlug = $state['tenant_slug'] ?? null;

            $googleUser = Socialite::driver('google')->stateless()->user();
            $email = $googleUser->getEmail();

            if ($context === 'admin') {
                return $this->handleAdminLogin($email, $request);
            }

            return $this->handleTenantLogin($email, $tenantSlug, $request);
        } catch (\Exception $e) {
            $errorMessage = urlencode('Error al autenticar con Google. Intenta de nuevo.');

            if (isset($context) && $context === 'admin') {
                return redirect()->away($this->buildAdminUrl("/login?error={$errorMessage}"));
            }

            return redirect()->away($this->buildTenantUrl($tenantSlug ?? '', "/login?error={$errorMessage}"));
        }
    }

    private function handleAdminLogin(string $email, Request $request)
    {
        $user = User::where('email', $email)
            ->where('role', 'SUPERADMIN')
            ->first();

        if (!$user) {
            $error = urlencode('No se encontró una cuenta de administrador con este correo.');
            return redirect()->away($this->buildAdminUrl("/login?error={$error}"));
        }

        if ($user->isInactive()) {
            $error = urlencode('Tu cuenta está inactiva. Contacta al administrador.');
            return redirect()->away($this->buildAdminUrl("/login?error={$error}"));
        }

        $user->updateLastLogin(client_ip());
        $this->logActivity('user_login', null, [
            'ip_address' => client_ip(),
            'method' => 'google',
            'user_agent' => $request->userAgent(),
        ], $user);

        Auth::login($user, true);
        $request->session()->regenerate();

        return redirect()->away($this->buildAdminUrl('/tenants'));
    }

    private function handleTenantLogin(string $email, ?string $tenantSlug, Request $request)
    {
        if (!$tenantSlug) {
            $error = urlencode('Institución no especificada.');
            return redirect()->away($this->buildFrontendUrl("/login?error={$error}"));
        }

        $tenant = Tenant::where('slug', $tenantSlug)->first();

        if (!$tenant) {
            $error = urlencode('Institución no encontrada.');
            return redirect()->away($this->buildTenantUrl($tenantSlug, "/login?error={$error}"));
        }

        if (!$tenant->is_active) {
            $error = urlencode('Tu institución está inactiva. Contacta al soporte.');
            return redirect()->away($this->buildTenantUrl($tenantSlug, "/login?error={$error}"));
        }

        $user = User::where('email', $email)
            ->where('tenant_id', $tenant->id)
            ->first();

        if (!$user) {
            $error = urlencode('No se encontró una cuenta con este correo en esta institución.');
            return redirect()->away($this->buildTenantUrl($tenantSlug, "/login?error={$error}"));
        }

        if ($user->isInactive()) {
            $error = urlencode('Tu cuenta está inactiva. Contacta al administrador.');
            return redirect()->away($this->buildTenantUrl($tenantSlug, "/login?error={$error}"));
        }

        $user->updateLastLogin(client_ip());
        $this->logActivity('user_login', null, [
            'ip_address' => client_ip(),
            'method' => 'google',
            'user_agent' => $request->userAgent(),
        ], $user);

        Auth::login($user, true);
        $request->session()->regenerate();

        return redirect()->away($this->buildTenantUrl($tenantSlug, '/dashboard'));
    }

    /**
     * Build frontend URL handling dev (path-based) vs production (subdomain-based).
     *
     * Dev:  http://127.0.0.1:3000/{slug}/dashboard
     * Prod: https://{slug}.intelicole.pe/dashboard
     */
    private function buildTenantUrl(string $slug, string $path): string
    {
        $frontendUrl = env('FRONTEND_URL', 'http://127.0.0.1:3000');

        if ($this->isDev()) {
            return "{$frontendUrl}/{$slug}{$path}";
        }

        $baseDomain = env('BASE_DOMAIN', 'intelicole.pe');
        return "https://{$slug}.{$baseDomain}{$path}";
    }

    private function buildAdminUrl(string $path): string
    {
        $frontendUrl = env('FRONTEND_URL', 'http://127.0.0.1:3000');

        if ($this->isDev()) {
            return "{$frontendUrl}/admin{$path}";
        }

        $baseDomain = env('BASE_DOMAIN', 'intelicole.pe');
        return "https://admin.{$baseDomain}{$path}";
    }

    private function buildFrontendUrl(string $path): string
    {
        return env('FRONTEND_URL', 'http://127.0.0.1:3000') . $path;
    }

    private function isDev(): bool
    {
        return app()->environment('local', 'development');
    }
}
