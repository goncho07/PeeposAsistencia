<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use App\Traits\LogsActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;


class AuthSessionController extends Controller
{
    use LogsActivity;

    /**
     * SPA login - session cookies only.
     *
     * POST /api/auth/login
     */
    public function login(LoginRequest $request): JsonResponse
    {
        app()->forgetInstance('current_tenant');
        app()->forgetInstance('current_tenant_id');

        $credentials = $request->validated();
        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales proporcionadas son incorrectas.'],
            ]);
        }

        if ($user->isInactive()) {
            return $this->error('Tu cuenta está inactiva. Contacta al administrador.', null, 403);
        }

        if ($user->role === 'SUPERADMIN') {
            if ($request->filled('tenant_slug')) {
                $tenant = \App\Models\Tenant::where('slug', $request->tenant_slug)->first();

                if (!$tenant) {
                    return $this->error('Institución no encontrada.', null, 404);
                }

                app()->instance('current_tenant', $tenant);
                app()->instance('current_tenant_id', $tenant->id);

                $user->update(['tenant_id' => $tenant->id]);
            }
        } else {
            if (!$user->tenant) {
                return $this->error('No tienes una institución asignada.', null, 403);
            }

            if (!$user->tenant->is_active) {
                return $this->error(
                    'Tu institución está inactiva. Contacta al soporte.',
                    ['error' => 'TENANT_INACTIVE'],
                    403
                );
            }

            if ($request->filled('tenant_slug')) {
                $tenant = \App\Models\Tenant::where('slug', $request->tenant_slug)->first();

                if (!$tenant) {
                    return $this->error('Institución no encontrada.', null, 404);
                }

                if ($user->tenant_id !== $tenant->id) {
                    return $this->error('No tienes acceso a esta institución.', null, 403);
                }
            }
        }

        $ip = client_ip();
        $user->updateLastLogin($ip);

        $this->logActivity('user_login', null, [
            'ip_address' => $ip,
            'user_agent' => $request->userAgent(),
        ], $user);

        Auth::login($user, $request->boolean('remember_me', false));
        $request->session()->regenerate();

        return $this->success([
            'user' => $this->formatUserData($user),
        ], 'Inicio de sesión exitoso');
    }

    /**
     * Format user data for response.
     */
    private function formatUserData(User $user): array
    {
        $userData = [
            'id' => $user->id,
            'name' => $user->full_name,
            'email' => $user->email,
            'role' => $user->role,
            'tenant_id' => $user->tenant_id,
            'tenant' => $user->tenant ? [
                'id' => $user->tenant->id,
                'name' => $user->tenant->name,
                'modular_code' => $user->tenant->modular_code,
                'ugel' => $user->tenant->ugel,
                'slug' => $user->tenant->slug,
                'logo_url' => get_storage_url($user->tenant->logo_url),
                'banner_url' => get_storage_url($user->tenant->banner_url),
                'background_url' => get_storage_url($user->tenant->background_url),
            ] : null,
        ];

        if ($user->role === 'SUPERADMIN' && $user->tenant_id) {
            $userData['viewing_tenant'] = true;
        }

        return $userData;
    }

    /**
     * SPA logout - session invalidation.
     *
     * POST /api/auth/logout
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        $this->logActivity('user_logout', null, [
            'ip_address' => client_ip(),
        ], $user);

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return $this->success(null, 'Sesión cerrada exitosamente');
    }

    /**
     * Get all active web sessions for the authenticated user.
     *
     * GET /api/auth/sessions
     */
    public function sessions(Request $request): JsonResponse
    {
        $user = $request->user();
        $currentSessionId = $request->session()->getId();

        $sessions = DB::table('sessions')
            ->where('user_id', $user->id)
            ->orderByDesc('last_activity')
            ->get()
            ->map(function ($session) use ($currentSessionId) {
                return [
                    'id' => $session->id,
                    'ip_address' => $session->ip_address,
                    'user_agent' => $session->user_agent,
                    'last_activity' => date('Y-m-d\TH:i:s.000000\Z', $session->last_activity),
                    'is_current' => $session->id === $currentSessionId,
                ];
            });

        return $this->success(['sessions' => $sessions]);
    }

    /**
     * Logout from all web sessions except the current one.
     *
     * POST /api/auth/logout-all
     */
    public function logoutAll(Request $request): JsonResponse
    {
        $user = $request->user();
        $currentSessionId = $request->session()->getId();

        $deleted = DB::table('sessions')
            ->where('user_id', $user->id)
            ->where('id', '!=', $currentSessionId)
            ->delete();

        $this->logActivity('user_logout_all_sessions', null, [
            'ip_address' => client_ip(),
            'sessions_closed' => $deleted,
        ], $user);

        return $this->success(null, 'Todas las demás sesiones han sido cerradas');
    }

    /**
     * Revoke a specific web session.
     *
     * DELETE /api/auth/sessions/{sessionId}
     */
    public function revokeSession(Request $request, string $sessionId): JsonResponse
    {
        $user = $request->user();
        $currentSessionId = $request->session()->getId();

        if ($sessionId === $currentSessionId) {
            return $this->error('No puedes revocar la sesión actual. Usa el endpoint de logout.', null, 400);
        }

        $deleted = DB::table('sessions')
            ->where('user_id', $user->id)
            ->where('id', $sessionId)
            ->delete();

        if (!$deleted) {
            return $this->error('Sesión no encontrada', null, 404);
        }

        $this->logActivity('session_revoked', null, [
            'session_id' => $sessionId,
        ], $user);

        return $this->success(null, 'Sesión revocada exitosamente');
    }

    /**
     * Change the authenticated user's password.
     *
     * POST /api/auth/change-password
     */
    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => ['required', 'string'],
            'new_password' => ['required', 'string', 'min:8', 'confirmed'],
        ], [
            'current_password.required' => 'La contraseña actual es obligatoria.',
            'new_password.required' => 'La nueva contraseña es obligatoria.',
            'new_password.min' => 'La nueva contraseña debe tener al menos :min caracteres.',
            'new_password.confirmed' => 'La confirmación de la nueva contraseña no coincide.',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['La contraseña actual es incorrecta.'],
            ]);
        }

        if ($request->current_password === $request->new_password) {
            throw ValidationException::withMessages([
                'new_password' => ['La nueva contraseña debe ser diferente a la actual.'],
            ]);
        }

        $user->update(['password' => $request->new_password]);

        $currentSessionId = $request->session()->getId();
        DB::table('sessions')
            ->where('user_id', $user->id)
            ->where('id', '!=', $currentSessionId)
            ->delete();

        $this->logActivity('password_changed', null, [
            'ip_address' => client_ip(),
        ], $user);

        return $this->success(null, 'Contraseña actualizada exitosamente');
    }

    /**
     * Update the authenticated user's profile.
     *
     * PUT /api/auth/profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'paternal_surname' => ['sometimes', 'required', 'string', 'max:100'],
            'maternal_surname' => ['sometimes', 'nullable', 'string', 'max:100'],
            'phone_number' => ['sometimes', 'nullable', 'string', 'max:20'],
        ], [
            'name.required' => 'El nombre es obligatorio.',
            'paternal_surname.required' => 'El apellido paterno es obligatorio.',
        ]);

        $user = $request->user();
        $user->update($validated);

        $this->logActivity('profile_updated', null, [
            'ip_address' => client_ip(),
        ], $user);

        return $this->success([
            'user' => [
                'id' => $user->id,
                'name' => $user->full_name,
                'first_name' => $user->name,
                'paternal_surname' => $user->paternal_surname,
                'maternal_surname' => $user->maternal_surname,
                'email' => $user->email,
                'document_type' => $user->document_type,
                'document_number' => $user->document_number,
                'role' => $user->role,
                'status' => $user->status,
                'phone_number' => $user->phone_number,
                'photo_url' => get_storage_url($user->photo_url),
                'last_login_at' => $user->last_login_at,
                'tenant_id' => $user->tenant_id,
                'tenant' => $user->tenant ? [
                    'id' => $user->tenant->id,
                    'name' => $user->tenant->name,
                    'modular_code' => $user->tenant->modular_code,
                    'slug' => $user->tenant->slug,
                    'logo_url' => get_storage_url($user->tenant->logo_url),
                    'banner_url' => get_storage_url($user->tenant->banner_url),
                    'background_url' => get_storage_url($user->tenant->background_url),
                    'timezone' => $user->tenant->timezone,
                ] : null,
            ],
        ], 'Perfil actualizado exitosamente');
    }

    /**
     * Get authenticated user information.
     *
     * GET /api/auth/user
     */
    public function user(Request $request): JsonResponse
    {
        $user = $request->user();

        $userData = [
            'id' => $user->id,
            'name' => $user->full_name,
            'first_name' => $user->name,
            'paternal_surname' => $user->paternal_surname,
            'maternal_surname' => $user->maternal_surname,
            'email' => $user->email,
            'document_type' => $user->document_type,
            'document_number' => $user->document_number,
            'role' => $user->role,
            'status' => $user->status,
            'phone_number' => $user->phone_number,
            'photo_url' => get_storage_url($user->photo_url),
            'last_login_at' => $user->last_login_at,
            'tenant_id' => $user->tenant_id,
            'tenant' => $user->tenant ? [
                'id' => $user->tenant->id,
                'name' => $user->tenant->name,
                'modular_code' => $user->tenant->modular_code,
                'slug' => $user->tenant->slug,
                'logo_url' => get_storage_url($user->tenant->logo_url),
                'banner_url' => get_storage_url($user->tenant->banner_url),
                'background_url' => get_storage_url($user->tenant->background_url),
                'timezone' => $user->tenant->timezone,
            ] : null,
        ];

        if ($user->role === 'SUPERADMIN' && $user->tenant_id) {
            $userData['viewing_tenant'] = true;
        }

        return $this->success(['user' => $userData]);
    }
}
